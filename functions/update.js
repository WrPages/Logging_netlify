exports.handler = async (event) => {
  try {

    const body = JSON.parse(event.body)

    const { action, id, group } = body

    if (!id || !group) {
      return { statusCode: 400, body: "Missing data" }
    }

    const GROUP_GISTS = {
      Trainer: "4edcf4d341cd4f7d5d0fb8a50f8b8c3c",
      Gym_Leader: "e110c37b3e0b8de83a33a1b0a5eb64e8",
      Elite_Four: "d9db3a72fed74c496fd6cc830f9ca6e9"
    }

    const GROUP_FILES = {
      Trainer: "trainer_ids.txt",
      Gym_Leader: "gym_ids.txt",
      Elite_Four: "elite_ids.txt"
    }

    const GIST_ID = GROUP_GISTS[group]
    const FILE_NAME = GROUP_FILES[group]

    const TOKEN = process.env.GITHUB_TOKEN

    // 🔥 GET
    const gistRes = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json",
        "Cache-Control": "no-cache"
      }
    })

    const gist = await gistRes.json()

    let content = gist.files[FILE_NAME]?.content || ""

    let ids = content
      .split("\n")
      .map(x => x.trim())
      .filter(x => x)

    // 🟢 ONLINE
    if (action === "online") {
      ids = ids.filter(x => x !== id)
      ids.push(id)
    }

    // 🔴 OFFLINE
    if (action === "offline") {
      ids = ids.filter(x => x !== id)
    }

    let newContent = ids.join("\n") || "\u200B"

    // 🔥 PATCH
    await fetch(`https://api.github.com/gists/${GIST_ID}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        files: {
          [FILE_NAME]: { content: newContent }
        }
      })
    })

    return { statusCode: 200, body: "OK" }

  } catch (err) {
    return {
      statusCode: 500,
      body: err.message
    }
  }
}
