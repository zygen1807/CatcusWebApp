export default function AdminCard({

title,
value

}:any){

return(

<div
className="border p-5 rounded"

>

<h2>

{title}

</h2>

<h1>

{value}

</h1>

</div>

)

}