import { pool } from '../db';
import { Contact } from '../models';

export class ContactService {
    async identifyContact(email: string | null, phoneNumber: string | null): Promise<any> {
        const client = await pool.connect();
        try {
            let primaryContact: Contact | null = null;
            let secondaryContacts: Contact[] = [];

            const existingContactsResult = await client.query(
                `SELECT * FROM Contact WHERE email = $1 OR phoneNumber = $2`,
                [email, phoneNumber]
            );
            const existingContacts: Contact[] = existingContactsResult.rows;

            if (existingContacts.length > 0) {
                primaryContact = this.findPrimaryContact(existingContacts);
                secondaryContacts = existingContacts.filter(c => c.id !== primaryContact?.id);
            }

            if (!primaryContact) {
                const newContactResult = await client.query(
                    `INSERT INTO Contact (email, phoneNumber, linkPrecedence) VALUES ($1, $2, 'primary') RETURNING *`,
                    [email, phoneNumber]
                );
                primaryContact = newContactResult.rows[0];
            } else {
                let updateNeeded = false;
                if (email && email !== primaryContact.email) {
                    updateNeeded = true;
                }
                if (phoneNumber && phoneNumber !== primaryContact.phoneNumber) {
                    updateNeeded = true;
                }
                if (updateNeeded) {
                    const updateResult = await client.query(`
                        UPDATE Contact 
                        SET email = COALESCE($1, email), phoneNumber = COALESCE($2, phoneNumber), updatedAt = NOW()
                        WHERE id = $3 RETURNING *
                    `, [email, phoneNumber, primaryContact.id]);
                    primaryContact = updateResult.rows[0];
                }

                const existingLink = existingContacts.find(c => (email && c.email === email) || (phoneNumber && c.phoneNumber === phoneNumber));
                if (!existingLink && (email !== primaryContact.email || phoneNumber !== primaryContact.phoneNumber)) {
                    await client.query(
                        `INSERT INTO Contact (email, phoneNumber, linkedId, linkPrecedence) VALUES ($1, $2, $3, 'secondary') RETURNING *`,
                        [email, phoneNumber, primaryContact.id]
                    );
                }
            }
            const allContactsResult = await client.query(`SELECT * FROM Contact WHERE id = $1 OR linkedId = $1`, [primaryContact.id]);
            const allContacts: Contact[] = allContactsResult.rows;

            const response = this.buildResponse(allContacts);
            return response;

        } finally {
            client.release();
        }
    }

    private findPrimaryContact(contacts: Contact[]): Contact | null {
        return contacts.find(c => c.linkPrecedence === 'primary') || null;
    }

    private buildResponse(contacts: Contact[]) {
        const primaryContact = contacts.find(c => c.linkPrecedence === 'primary');
        if (!primaryContact) return null;

        const emails = [...new Set(contacts.map(c => c.email).filter(e => e !== null))] as string[];
        const phoneNumbers = [...new Set(contacts.map(c => c.phoneNumber).filter(p => p !== null))] as string[];
        const secondaryContactIds = contacts.filter(c => c.linkPrecedence === 'secondary').map(c => c.id);

        return {
            contact: {
                primaryContatctId: primaryContact.id,
                emails: emails,
                phoneNumbers: phoneNumbers,
                secondaryContactIds: secondaryContactIds,
            },
        };
    }
}