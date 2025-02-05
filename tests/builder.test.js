import Post from './dummy/models/Post'
import ModelWithParamNames from './dummy/models/ModelWithParamNames';
import { Model } from '../src'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter';

describe('Query builder', () => {

  let errorModel = {}
  Model.$http = axios
  let axiosMock = new MockAdapter(axios)

  beforeEach(() => {
    axiosMock.reset()
  })

  test('it builds a complex query', () => {
    const post = Post
      .include('user')
      .append('likes')
      .select({
        posts: ['title', 'content'],
        user: ['age', 'firstname']
      })
      .where('title', 'Cool')
      .where('status', 'ACTIVE')
      .page(3)
      .limit(10)
      .orderBy('created_at')
      .params({
        'doSomething': 'yes',
        'process': 'no'
      })

    const query = '?include=user&append=likes&fields[posts]=title,content&fields[user]=age,firstname&filter[title]=Cool&filter[status]=ACTIVE&sort=created_at&page=3&limit=10&doSomething=yes&process=no'

    expect(post._builder.query()).toEqual(query)
  })

  test('it builds a complex query with custom param names', () => {
    const post = ModelWithParamNames
      .include('user')
      .append('likes')
      .select({
        posts: ['title', 'content'],
        user: ['age', 'firstname']
      })
      .where('title', 'Cool')
      .where('status', 'ACTIVE')
      .page(3)
      .limit(10)
      .orderBy('created_at')

    const query = '?include_custom=user&append_custom=likes&fields_custom[posts]=title,content&fields_custom[user]=age,firstname&filter_custom[title]=Cool&filter_custom[status]=ACTIVE&sort_custom=created_at&page_custom=3&limit_custom=10'

    expect(post._builder.query()).toEqual(query)
  })

  test('include() sets properly the builder', () => {
    let post = Post.include('user')

    expect(post._builder.includes).toEqual(['user'])

    post = Post.include('user', 'category')

    expect(post._builder.includes).toEqual(['user', 'category'])
  })

  test('append() sets properly the builder', () => {
    let post = Post.append('likes')

    expect(post._builder.appends).toEqual(['likes'])

    post = Post.append('likes', 'visits')

    expect(post._builder.appends).toEqual(['likes', 'visits'])
  })

  test('orderBy() sets properly the builder', () => {
    let post = Post.orderBy('created_at')

    expect(post._builder.sorts).toEqual(['created_at'])

    post = Post.orderBy('created_at', '-visits')

    expect(post._builder.sorts).toEqual(['created_at', '-visits'])
  })

  test('where() sets properly the builder', () => {
    let post = Post.where('id', 1)

    expect(post._builder.filters).toEqual({ id: 1 })

    post = Post.where('id', 1).where('title', 'Cool')

    expect(post._builder.filters).toEqual({ id: 1, title: 'Cool' })
  })

  test('where() throws a exception when doest not have params or only first param', () => {
    let errorModel = () => {
      const post = Post.where()
    }

    expect(errorModel).toThrow('The KEY and VALUE are required on where() method.')

    errorModel = () => {
      const post = Post.where('id')
    }

    expect(errorModel).toThrow('The KEY and VALUE are required on where() method.')
  })

  test('where() throws a exception when second parameter is not primitive', () => {
    let errorModel = () => {
      const post = Post.where('id', ['foo'])
    }

    expect(errorModel).toThrow('The VALUE must be primitive on where() method.')
  })

  test('whereIn() sets properly the builder', () => {
    let post = Post.whereIn('status', ['ACTIVE', 'ARCHIVED'])

    expect(post._builder.filters).toEqual({ status: 'ACTIVE,ARCHIVED' })
  })

  test('whereIn() throws a exception when second parameter is not a array', () => {
    let errorModel = () => {
      const post = Post.whereIn('id', 'foo')
    }

    expect(errorModel).toThrow('The second argument on whereIn() method must be an array.')
  })


  test('page() sets properly the builder', () => {
    let post = Post.page(3)

    expect(post._builder.pageValue).toEqual(3)
  })

  test('page() throws a exception when value is not a number', () => {
    let errorModel = () => {
      const post = Post.page('foo')
    }

    expect(errorModel).toThrow('The VALUE must be an integer on page() method.')
  })

  test('limit() sets properly the builder', () => {
    let post = Post.limit(10)

    expect(post._builder.limitValue).toEqual(10)
  })

  test('limit() throws a exception when value is not a number', () => {
    let errorModel = () => {
      const post = Post.limit('foo')
    }

    expect(errorModel).toThrow('The VALUE must be an integer on limit() method.')
  })

  test('select() with no parameters', () => {
    let errorModel = () => {
      const post = Post.select()
    }

    expect(errorModel).toThrow('You must specify the fields on select() method.')
  })

  test('select() for single entity', () => {
    let post = Post.select('age', 'firstname')

    expect(post._builder.fields.posts).toEqual('age,firstname')
  })

  test('select() for related entities', () => {
    let post = Post.select({
      posts: ['title', 'content'],
      user: ['age', 'firstname']
    })

    expect(post._builder.fields.posts).toEqual('title,content')
    expect(post._builder.fields.user).toEqual('age,firstname')
  })

  test('params() sets properly the builder', () => {
    let post = Post.params({ 'doSomething': 'yes' })

    expect(post._builder.payload).toEqual({ 'doSomething': 'yes' })
  })

  test('params() throws a exception when the payload is not an object', () => {
    let errorModel = () => {
      const post = Post.params()
    }

    expect(errorModel).toThrow('You must pass a payload/object as param.')
  })

  test('it resets the uri upon query generation when the query is regenerated a second time', () => {
    const post = Post
      .where('title', 'Cool')
      .page(4)

    const query = '?filter[title]=Cool&page=4'

    expect(post._builder.query()).toEqual(query)
    expect(post._builder.query()).toEqual(query)
  })
})