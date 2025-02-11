import { Request, Response } from 'express';
import { ContactService } from '../services/contactService';

const contactService = new ContactService();

export const identifyContact = async (req: Request, res: Response) => {
    try {
        const { email, phoneNumber } = req.body;
        const contact = await contactService.identifyContact(email, phoneNumber);
        res.json(contact);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred.' });
    }
};