import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  const { message } = await req.json()

  const q = message.toLowerCase()

  /*
   ---------------------------------------
   1. SEARCH PROJECTS (better matching)
   ---------------------------------------
  */

  const { data: projects } = await supabase
    .from("furniture_projects")
    .select("*")
    .or(`title.ilike.%${q}%,keywords.ilike.%${q}%`)
    .limit(3)

  /*
   ---------------------------------------
   2. SEARCH TECHNIQUES
   ---------------------------------------
  */

  const { data: techniques } = await supabase
    .from("techniques")
    .select("*")
    .or(`title.ilike.%${q}%,keywords.ilike.%${q}%`)
    .limit(5)

  /*
   ---------------------------------------
   3. IF NOTHING FOUND → fallback response
   ---------------------------------------
  */

  if (!projects || projects.length === 0) {
    return NextResponse.json({
      reply:
        "❌ No woodworking knowledge found. Try different keywords or ask admin to add more projects.",
      project: null,
      steps: [],
      techniques: []
    })
  }

  const project = projects[0]

  /*
   ---------------------------------------
   4. GET STEPS
   ---------------------------------------
  */

  const { data: steps } = await supabase
    .from("project_steps")
    .select("*")
    .eq("project_id", project.id)
    .order("step_no")

  /*
   ---------------------------------------
   5. BUILD CONTEXT (RAG CORE)
   ---------------------------------------
  */

  let reply = `🪵 PROJECT: ${project.title}\n\n`

  reply += `📌 Description:\n${project.description ?? "No description"}\n\n`

  reply += `💰 Estimated Price: ₱${project.price ?? "N/A"}\n\n`

  reply += `📋 Steps:\n`

  steps?.forEach((s) => {
    reply += `\n${s.step_no}. ${s.title}\n`
    reply += `${s.instruction}\n`
  })

  /*
   ---------------------------------------
   6. TECHNIQUES (RICH CONTEXT)
   ---------------------------------------
  */

  if (techniques && techniques.length > 0) {
    reply += `\n🧠 Related Techniques:\n`

    techniques.forEach((t) => {
      reply += `- ${t.title}: ${t.description ?? ""}\n`
    })
  }

  /*
   ---------------------------------------
   7. VIDEO
   ---------------------------------------
  */

  if (project.youtube_url) {
    reply += `\n▶ Tutorial:\n${project.youtube_url}\n`
  }

  /*
   ---------------------------------------
   8. RETURN RAG RESPONSE
   ---------------------------------------
  */

  return NextResponse.json({
    reply,
    project,
    steps: steps ?? [],
    techniques: techniques ?? []
  })
}