export async function loginAdmin(phone: string, password: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/graphql`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation AdminLogin($phone: String!, $password: String!) {
            adminLogin(phone: $phone, password: $password) {
              token
              admin { id name role }
            }
          }
        `,
        variables: { phone, password },
      }),
    }
  );
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data.adminLogin;
}
