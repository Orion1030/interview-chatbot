export type BasicSession = {
  user: {
    id: string
    name: string
    email: string
  }
}

export async function auth(): Promise<BasicSession | null> {
  const username = process.env.AUTH_USERNAME

  if (!username) {
    return {
      user: {
        id: 'guest',
        name: 'Guest',
        email: 'guest@local'
      }
    }
  }

  return {
    user: {
      id: username,
      name: username,
      email: `${username}@local`
    }
  }
}
