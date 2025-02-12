import { Request, Response } from 'express';
import { ContactService } from '../services/contactService';

const contactService = new ContactService();

export const identifyContact = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, phoneNumber } = req.body;
        
        // Input validation
        if (email && typeof email !== 'string') {
            res.status(400).json({ error: 'Invalid email format' });
            return;
        }
        if (phoneNumber && typeof phoneNumber !== 'string') {
            res.status(400).json({ error: 'Invalid phone number format' });
            return;
        }
        if (!email && !phoneNumber) {
            res.status(400).json({ 
                error: 'Either email or phoneNumber must be provided' 
            });
            return;
        }

        const contact = await contactService.identifyContact(email, phoneNumber);
        res.json(contact);
    } catch (error) {
        console.error('Error in identify controller:', error);
        res.status(500).json({ 
            error: 'Internal server error' 
        });
    }
};