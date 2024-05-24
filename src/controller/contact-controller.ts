import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function identify(req: express.Request, res: express.Response) {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phone number must be provided" });
  }

  try {
    const contacts = await prisma.contact.findMany({
      where: {
        OR: [{ email }, { phoneNumber }],
      },
    });

    if (contacts.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary",
        },
      });

      return res.json({
        contact: {
          primaryContactId: newContact.id,
          emails: [newContact.email].filter(Boolean),
          phoneNumbers: [newContact.phoneNumber].filter(Boolean),
          secondaryContactIds: [],
        },
      });
    }

    let primaryContact = contacts.reduce((oldest, contact) => {
      return contact.createdAt < oldest.createdAt ? contact : oldest;
    }, contacts[0]);

    // for (const contact of contacts) {
    //   if (contact.id !== primaryContact.id && contact.linkedId !== primaryContact.id) {
    //     await prisma.contact.update({
    //       where: { id: contact.id },
    //       data: {
    //         linkedId: primaryContact.id,
    //         linkPrecedence: "secondary",
    //       },
    //     });
    //   }
    // }

    for (const contact of contacts) {
      if (contact.id !== primaryContact.id && contact.linkedId !== primaryContact.id && !((contact.email === null && email === null) || (contact.phoneNumber === null && phoneNumber === null))) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            linkedId: primaryContact.id,
            linkPrecedence: "secondary",
          },
        });
      }
    }
    // Check if the provided data matches an existing contact
    const emailMatch = email && contacts.some((contact) => contact.email === email);
    const phoneMatch = phoneNumber && contacts.some((contact) => contact.phoneNumber === phoneNumber);

    // Create a new secondary contact if there's new information
    if ((email && !emailMatch) || (phoneNumber && !phoneMatch)) {
      await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: "secondary",
        },
      });
    }

    // Gather all linked contacts
    const allContacts = await prisma.contact.findMany({
      where: {
        OR: [{ id: primaryContact.id }, { linkedId: primaryContact.id }],
      },
    });
    console.log(allContacts, "contacts");
    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryContactIds: number[] = [];

    for (const contact of allContacts) {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
      if (contact.id !== primaryContact.id) secondaryContactIds.push(contact.id);
    }

    res.json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default identify;
