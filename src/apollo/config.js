import cache from './cache'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { getMainDefinition } from 'apollo-utilities'
import { split } from 'apollo-link'
import { setContext } from 'apollo-link-context'

export default function(ctx) {

    let link = null

    link = new HttpLink( { uri: `${process.env.NUXT_ENV_API_HOST}/graphql` } )

    const authLink = setContext( (_, { headers } ) => {

        return {
            headers: {
                ...headers,
                Authorization: ctx.$auth.strategy.token.get(),
            },
        }

    } )

    link = authLink.concat(link)

    const wsClient = new SubscriptionClient(`${process.env.NUXT_ENV_API_HOST_WS}/graphql`, {
        reconnect        : true,
        connectionParams : () => {

            return {
                headers: {
                    Authorization: ctx.$auth.strategy.token.get(),
                },
            }

        },
    } )

    const wsLink = new WebSocketLink(wsClient)

    link = split(
        // split based on operation type
        ( { query } ) => {

            const { kind, operation } = getMainDefinition(query)

            return kind === 'OperationDefinition' && operation === 'subscription'

        },
        wsLink,
        link,
    )

    return {
        link,
        cache,
    }

}
