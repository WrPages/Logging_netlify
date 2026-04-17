exports.handler = async (event) => {
  try {
    const { action, id, group } = event.queryStringParameters || {}

    if (!action || !id || !group) {
      return json({ error: "missing params" }, 400)
    }

    const GROUPS = {
      Trainer: {
        gist: "4edcf4d341cd4f7d5d0fb8a50f8b8c3c",
        file: "trainer_ids.txt"
      },
      Gym_Leader: {
        gist: "e110c37b3e0b8de83a33a1b0a5eb64e8",
        file: "gym_ids.txt"
      },
      Elite_Four: {
        gist: "d9db3a72fed74c496fd6cc830f9ca6e9",
        file: "elite_ids.txt"
      }
    }

    const cfg = GROUPS[group]
    if (!cfg) return json({ error: "invalid group" }, 400)

    const TOKEN = process.env.GITHUB_TOKEN

    if (!TOKEN) {
      return json({ error: "NO GITHUB TOKEN IN NETLIFY ENV" }, 500)
    }

    // 🔥 READ GIST
    const readRes = await fetch(`https://api.github.com/gists/${cfg.gist}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json"
      }
    })

    const readText = await readRes.text()

    if (!readRes.ok) {
      return json({
        error: "READ GIST FAILED",
        details: readText
      }, 500)
    }

    const gist = JSON.parse(readText)

    let content = gist.files?.[cfg.file]?.content || ""

    let ids = content
      .split("\n")
      .map(x => x.trim())
      .filter(Boolean)

    // 🔥 LOGICA
    if (action === "online") {
      if (!ids.includes(id)) ids.push(id)
    }

    if (action === "offline") {
      ids = ids.filter(x => x !== id)
    }

    const newContent = ids.join("\n") || "\u200B"

    // 🔥 WRITE
    const writeRes = await fetch(`https://api.github.com/gists/${cfg.gist}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        Accept: "application/vnd.github+json"
      },
      body: JSON.stringify({
        files: {
          [cfg.file]: {
            content: newContent
          }
        }
      })
    })

    const writeText = await writeRes.text()

    if (!writeRes.ok) {
      return json({
        error: "WRITE FAILED",
        details: writeText
      }, 500)
    }

    return json({ ok: true })

  } catch (e) {
    return json({ error: e.message }, 500)
  }
}

function json(data, status = 200) {
  return {
    statusCode: status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(data, null, 2)
  }
}
