import { supabase } from "@/lib/supabase"

export default async function Projects() {
  const { data } = await supabase.from("furniture_projects").select("*")

  return (
    <div style={{ padding: 20 }}>
      <h1>Projects</h1>

      {data?.map((p) => (
        <div key={p.id}>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <img src={p.thumbnail} width={200} />
        </div>
      ))}
    </div>
  )
}