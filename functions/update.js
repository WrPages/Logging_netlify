export async function handler(event) {

  const { action, id } = JSON.parse(event.body);

  const GIST_ID = process.env.GIST_ONLINE;
  const TOKEN = process.env.GITHUB_TOKEN;

  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: { Authorization: `Bearer ${TOKEN}` }
  });

  const data = await res.json();
  const file = Object.keys(data.files)[0];

  let content = data.files[file].content || "";
  let ids = content.split("\n").filter(Boolean);

  if (action === "online" && !ids.includes(id)) ids.push(id);
  if (action === "offline") ids = ids.filter(x => x !== id);

  await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${TOKEN}` },
    body: JSON.stringify({
      files: {
        [file]: { content: ids.join("\n") }
      }
    })
  });

  return {
    statusCode: 200,
    body: "✅ Listo"
  };
}
