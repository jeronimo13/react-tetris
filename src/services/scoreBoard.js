import { GraphQLClient } from "graphql-request";
const client = new GraphQLClient(
  "https://api.graph.cool/simple/v1/cjtyw2zs55c480149tcqysrt4",
  {
    //   headers: {
    //     Authorization: 'Bearer YOUR_AUTH_TOKEN',
    //   },
  }
);

async function getUsers() {
  return client.request(`
  {
    allUsers(orderBy:
      score_DESC,
      first:100
    ){
      score
      id
      name
      createdAt
      updatedAt
    }
  }
    
  `);
}

const setRecord = async (name, score) => {
  const data = await client.request(
    ` mutation createUser($name: String!, $score: Int!) {
        createUser(
            name: $name,
            score: $score
        ) {
            id
            name,
            score
        }
}
  `,
    {
      name,
      score
    }
  );
  return data.createUser;
};

export { setRecord, getUsers };
