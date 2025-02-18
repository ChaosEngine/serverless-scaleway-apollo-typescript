export const demoHandler = async (event: Event/* , _context: unknown */) => {
  console.log(event);
  return {
    body: JSON.stringify({
      message: 'Hello, Serverless Meetup !'
    }),
    statusCode: 200,
  }
}
