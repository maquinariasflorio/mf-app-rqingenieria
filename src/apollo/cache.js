import { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory'
import introspectionQueryResultData from './graphql.schema.json'

const fragmentMatcher = new IntrospectionFragmentMatcher( {
    introspectionQueryResultData,
} )

export default new InMemoryCache( {
    fragmentMatcher,
    addTypename: false,
} )
