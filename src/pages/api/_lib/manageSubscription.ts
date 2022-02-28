import { query as q, query } from 'faunadb';
import { fauna } from "../../../Services/fauna";
import { stripe } from '../../../Services/stripe';

export async function saveSubscriptions(subscriptionId: string, customerId: string, creacteAction = false) {
    const userRef = await fauna.query(
        q.Select(
            "ref",
            q.Get(q.Match(q.Index('user_by_stripe_customer_id'), customerId))
        )
    );
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id,

    }
    if (creacteAction) {
        await fauna.query(q.Create(q.Collection('subscriptions'), { data: subscriptionData }))
    } else {
        await fauna.query(
            q.Replace(
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index('subscriptions_by_id'),
                            subscriptionId
                        )
                    )
                ),
                { data: subscriptionData }
            )
        )
    }
}