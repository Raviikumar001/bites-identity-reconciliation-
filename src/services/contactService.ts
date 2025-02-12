import { pool } from '../db';
import { Contact } from '../models';

interface ContactResponse {
  contact: {
    primaryContactId: number;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: number[];
  };
}

export class ContactService {
  async identifyContact(email: string | null, phoneNumber: string | null): Promise<ContactResponse> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // 1. Find all related contacts through email or phone
      const relatedContactsResult = await client.query(
        `
        WITH RECURSIVE ContactLinks AS (
          -- Base: Find contacts matching email or phone
          SELECT * FROM "Contact" 
          WHERE ("email" = $1 AND "email" IS NOT NULL)
             OR ("phoneNumber" = $2 AND "phoneNumber" IS NOT NULL)
          
          UNION
          
          -- Recursive: Find all linked contacts
          SELECT c.*
          FROM "Contact" c
          INNER JOIN ContactLinks cl ON 
            c."id" = cl."linkedId" OR 
            cl."id" = c."linkedId"
        )
        SELECT * FROM ContactLinks
        ORDER BY "createdAt" ASC
        `,
        [email, phoneNumber]
      );

      let contacts = relatedContactsResult.rows;

      // 2. No existing contacts - create new primary
      if (contacts.length === 0) {
        const newContactResult = await client.query(
          `
          INSERT INTO "Contact" 
            ("phoneNumber", "email", "linkedId", "linkPrecedence", "createdAt", "updatedAt")
          VALUES ($1, $2, NULL, 'primary', NOW(), NOW())
          RETURNING *
          `,
          [phoneNumber, email]
        );
        contacts = [newContactResult.rows[0]];
      } 
      // 3. Existing contacts found
      else {
        // Find the primary contact (oldest one)
        const primaryContact = contacts.reduce((oldest, current) => 
          new Date(oldest.createdAt) <= new Date(current.createdAt) ? oldest : current
        );

        // Convert any other primaries to secondary
        for (const contact of contacts) {
          if (contact.linkPrecedence === 'primary' && contact.id !== primaryContact.id) {
            await client.query(
              `
              UPDATE "Contact"
              SET "linkPrecedence" = 'secondary',
                  "linkedId" = $1,
                  "updatedAt" = NOW()
              WHERE "id" = $2
              `,
              [primaryContact.id, contact.id]
            );
            contact.linkPrecedence = 'secondary';
            contact.linkedId = primaryContact.id;
          }
        }

        // Check if we need to create a new secondary contact
        const hasNewEmail = email && !contacts.some(c => c.email === email);
        const hasNewPhone = phoneNumber && !contacts.some(c => c.phoneNumber === phoneNumber);

        if (hasNewEmail || hasNewPhone) {
          const newSecondaryResult = await client.query(
            `
            INSERT INTO "Contact"
              ("phoneNumber", "email", "linkedId", "linkPrecedence", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, 'secondary', NOW(), NOW())
            RETURNING *
            `,
            [phoneNumber, email, primaryContact.id]
          );
          contacts.push(newSecondaryResult.rows[0]);
        }
      }

      await client.query('COMMIT');
      return this.buildResponse(contacts);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in identifyContact:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  private buildResponse(contacts: Contact[]): ContactResponse {
    // Find primary (oldest) contact
    const primaryContact = contacts.reduce((oldest, current) => 
      new Date(oldest.createdAt) <= new Date(current.createdAt) ? oldest : current
    );

    if (!primaryContact) {
      throw new Error('Primary contact not found');
    }

    // Collect unique emails (primary first)
    const emails: string[] = [];
    if (primaryContact.email) {
      emails.push(primaryContact.email);
    }
    contacts.forEach(contact => {
      if (contact.id !== primaryContact.id && contact.email && !emails.includes(contact.email)) {
        emails.push(contact.email);
      }
    });

    // Collect unique phone numbers (primary first)
    const phoneNumbers: string[] = [];
    if (primaryContact.phoneNumber) {
      phoneNumbers.push(primaryContact.phoneNumber);
    }
    contacts.forEach(contact => {
      if (contact.id !== primaryContact.id && contact.phoneNumber && !phoneNumbers.includes(contact.phoneNumber)) {
        phoneNumbers.push(contact.phoneNumber);
      }
    });

    // Get all secondary contact IDs
    const secondaryContactIds = contacts
      .filter(contact => contact.id !== primaryContact.id)
      .map(contact => contact.id);

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds
      }
    };
  }
}