import supertest from 'supertest';
import app from '../app'; 

const request = supertest(app);

describe("GET /api/stories", () => {
  it("should return a list of stories for the given difficulty and genre", async () => {
    const response = await request.get('/api/stories')
      .query({ difficulty: 'easy', genre: 'adventure' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toEqual(expect.stringContaining("json"));
    expect(response.body).toBeInstanceOf(Array);

    expect(response.body).toHaveLength(1);
  });

});
