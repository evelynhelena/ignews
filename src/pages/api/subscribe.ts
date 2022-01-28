import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import {query as q} from "faunadb";
import { fauna } from "../../Services/fauna";
import {stripe} from "../../Services/stripe";

type User = {
    ref:{
        id:string;
    }
    data:{
        stripe_customer_id: string
    }
}

const subscripe = async (req: NextApiRequest, res: NextApiResponse) => {
    if(req.method === 'POST'){
        const session = await getSession({req})

        const user = await fauna.query<User>(
            q.Get(q.Match(q.Index('user_by_email'),q.Casefold(session.user.email)))
        )

        let customerId = user.data.stripe_customer_id

        if(!customerId){
            const stipeCustomer = await stripe.customers.create({
                email:session.user.email,
            })
            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'),user.ref.id),
                    {
                        data:{
                            stripe_customer_id: stipeCustomer.id
                        }
                    }
                )
            )

            customerId = stipeCustomer.id
        }


        const stripeChekoutSessions = await stripe.checkout.sessions.create({
            customer:customerId,
            payment_method_types:['card'],
            billing_address_collection:'required',
            line_items:[{price:'price_1KFLKTLiy1zMR4IDpMbB0b0a',quantity: 1}],
            mode: 'subscription',
            allow_promotion_codes:true,
            success_url:process.env.STRIPE_SUCCESS_URL,
            cancel_url:process.env.STRIPE_CALCEL_URL
        })

        return res.status(200).json({sessionId: stripeChekoutSessions.id})
    }else{
        res.setHeader('Allow', 'POST')
        res.status(405).send('Method Not Allowed');
    }
}
export default subscripe;