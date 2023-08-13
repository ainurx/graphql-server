const express = require('express')
const app = express()

// Data
const Authors = require('./data/Authors')
const Books = require('./data/Books')

// Graphql dependencies
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
   GraphQLSchema,
   GraphQLObjectType,
   GraphQLNonNull,
   GraphQLString,
   GraphQLInt,
   GraphQLList,
} = require('graphql')

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: 'Represent the author',
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLInt)},
    name: { type: new GraphQLNonNull(GraphQLString)},
    books: {
      type: new GraphQLList(BooksType),
      resolve: (author) => Books.filter((book) => book.authorId === author.id) 
    }
  })
})

const BooksType = new GraphQLObjectType({
  name: 'Book',
  description: 'Represent a book that written by author',
  fields: ()=> ({
    id: { type: new GraphQLNonNull(GraphQLInt)},
    name: { type: new GraphQLNonNull(GraphQLString)},
    authorId: { type: new GraphQLNonNull(GraphQLInt)},
    authors: {
      type: AuthorType,
      resolve: (book) => Authors.find( author => author.id === book.authorId )
    }
  })
})

const RootQuery =  new GraphQLObjectType({
  name: 'Query',
  description: 'Root Query',
  fields: ()=> ({
    books: {
      type: new GraphQLList(BooksType),
      description: 'List of all book',
      resolve: ()=> Books
    },
    book: {
      type: BooksType,
      description: 'return a book data',
      args: { 
        id: {
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve: (parent, args) => Books.find(book => book.id === args.id)
    },
    authors: {
      type: new GraphQLList(AuthorType),
      description: 'List of all author',
      resolve: ()=> Authors
    },
    author: {
      type: AuthorType,
      description: 'return author',
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLInt)
        }
      },
      resolve: (parent, args) => Authors.find((author) => author.id === args.id)
    }
  }) 
})

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  description: 'Root Mutation',
  fields: ()=> ({
    addAuthor: {
      type: AuthorType,
      description: 'Add author',
      args: {
        name: {
          type: new GraphQLNonNull(GraphQLString)
        }
      },
      resolve: (parent, args)=> {
        const author = {
          id: Authors.length + 1, 
          name: args.name
        }

        Authors.push(author)
        return author
      }
    },
    addBook: {
      type: BooksType,
      description: 'Add book',
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        authorId: { type: new GraphQLNonNull(GraphQLInt)}
      },
      resolve: (parent, args) =>{
        const book = {
          id: Books.length + 1,
          name: args.name,
          authorId: args.authorId
        }

        Books.push(book)

        return book
      }
    }
  })
})

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
})

app.use('/graphql', expressGraphQL({
  schema,
  graphiql: true
}));


app.get('/', (req, res)=>{
  res.send({ msg: 'Hello world'})
})

app.listen(5000, ()=> console.log('graphql server is running ...'))