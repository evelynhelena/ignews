import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from 'stream';
import { Stripe } from "stripe";
import { stripe } from "../../Services/stripe";
import { saveSubscriptions } from "./_lib/manageSubscription";

async function buffer(readable: Readable) {
    const chunks = [];

    for await (const chunck of readable) {
        chunks.push(
            typeof chunck === "string" ? Buffer.from(chunck) : chunck
        );
    }

    return Buffer.concat(chunks);
}

export const config = {
    api: {
        bodyParser: false
    }
}

const relevantEvents = new Set([
    'checkout.session.completed',
    'customer.subscriptions.created',
    'customer.subscriptions.updated',
    'customer.subscriptions.deleted'
])

const webhooks = async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === 'POST'){
        const buf = await buffer(req);
        const secret = req.headers['stripe-signature'];

        let event: Stripe.Event;

        try{
            event = stripe.webhooks.constructEvent(buf,secret,process.env.STRIPE_WEBHOOK_SECRET);
        }catch(err){
            return res.status(400).send(`webhooks error: ${err.message}`)
        }

        const {type} = event;

        if(relevantEvents.has(type)){
            try{
                switch(type){
                    case 'checkout.session.completed':
                        const checkoutSession = event.data.object as Stripe.Checkout.Session;
                        await saveSubscriptions(checkoutSession.subscription.toString(),checkoutSession.customer.toString());
                        break;
                    default:
                        throw new Error('uUnhandled event.')
                }
            }catch(err){
                return res.json({error: 'Webhook handlrer failed'});
            }
        }

    
        res.json({ received: true })
    }else{
        res.setHeader('Allow', 'POST')
        res.status(405).send('Method Not Allowed');
    }
}

export default webhooks;