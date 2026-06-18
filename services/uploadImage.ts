import { supabase } from "@/lib/supabase"

export async function uploadImage(
bucket:string,
file:File
){

const fileName=
`${Date.now()}-${file.name}`

const { error }=
await supabase
.storage
.from(bucket)
.upload(
fileName,
file
)

if(error)
throw error

const {
data
}
=
supabase
.storage
.from(bucket)
.getPublicUrl(
fileName
)

return data.publicUrl

}