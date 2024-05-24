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
  } catch (error) {
    console.log(error);
  }
}

export default identify;
