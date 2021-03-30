export const demoHandler = async (event: any, _context: unknown) => {
  console.log(event);
  return {
    body: JSON.stringify({
      message: 'Hello, Serverless Meetup !'
    }),
    statusCode: 200,
  }
}
