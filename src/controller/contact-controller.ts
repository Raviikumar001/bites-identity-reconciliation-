import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function identify(req: express.Request, res: express.Response) {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    return res.status(400).json({ error: "Email or phoneNumber must be provided" });
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

    let primaryContact = contacts.find((contact) => contact.linkPrecedence === "primary");
    if (!primaryContact) {
      primaryContact = contacts[0];
    }

    // Update secondary contacts to link to  pri. contact
    for (const contact of contacts) {
      if (contact.id !== primaryContact.id) {
        await prisma.contact.update({
          where: { id: contact.id },
          data: {
            linkedId: primaryContact.id,
            linkPrecedence: "secondary",
          },
        });
      }
    }

    const emails = new Set<string>();
    const phoneNumbers = new Set<string>();
    const secondaryContactIds = [];

    for (const contact of contacts) {
      if (contact.email) emails.add(contact.email);
      if (contact.phoneNumber) phoneNumbers.add(contact.phoneNumber);
      if (contact.id !== primaryContact.id) secondaryContactIds.push(contact.id);
    }

    if (email) emails.add(email);
    if (phoneNumber) phoneNumbers.add(phoneNumber);

    res.json({
      contact: {
        primaryContactId: primaryContact.id,
        emails: Array.from(emails),
        phoneNumbers: Array.from(phoneNumbers),
        secondaryContactIds,
      },
    });
  } catch (error) {
    console.log(error);
  }
}

export default identify;
