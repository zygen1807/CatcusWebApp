import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: Request) {
  const { message } = await req.json()

  const q = message.toLowerCase()

  // 1. Find project
  const { data: project } = await supabase
    .from("furniture_projects")
    .select("*")
    .or(`title.ilike.%${q}%,keywords.ilike.%${q}%`)
    .limit(1)
    .single()

  // 2. Find technique
  const { data: techniques } = await supabase
    .from("techniques")
    .select("*")
    .or(`title.ilike.%${q}%,keywords.ilike.%${q}%`)
    .limit(3)

  if (!project) {
    return NextResponse.json({
      reply: "❌ No woodworking knowledge found. Ask admin to add it."
    })
  }

  // 3. Get steps
  const { data: steps } = await supabase
    .from("project_steps")
    .select("*")
    .eq("project_id", project.id)
    .order("step_no")

  // 4. Build response (THIS is your “AI brain”)
  let reply = `🪵 ${project.title}\n\n`
  reply += `📌 Description: ${project.description}\n\n`
  reply += `💰 Estimated Price: ₱${project.price}\n\n`

  reply += `📋 Steps:\n`
  steps?.forEach((s) => {
    reply += `\n${s.step_no}. ${s.title}\n${s.instruction}\n`
  })

  if (techniques?.length) {
    reply += `\n🧠 Techniques:\n`
    techniques.forEach((t) => {
      reply += `- ${t.title}\n`
    })
  }

  if (project.youtube_url) {
    reply += `\n▶ Watch Tutorial: ${project.youtube_url}\n`
  }

  return NextResponse.json({
    reply,
    project,
    steps,
    techniques
  })
}