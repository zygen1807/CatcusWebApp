"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/services/uploadImage";

type Project = {
  id?: string;
  title: string;
  description: string;
  price: string;
  difficulty: string;
  youtube_url: string;
  thumbnail: string;
};

const emptyForm: Project = {
  title: "",
  description: "",
  price: "",
  difficulty: "",
  youtube_url: "",
  thumbnail: "",
};

export default function Projects() {
  const [projects, setProjects] =
    useState<Project[]>([]);

  const [search, setSearch] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [file, setFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  const [form, setForm] =
    useState<Project>(
      emptyForm
    );

  function update(
    key: keyof Project,
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function closeModal() {
    setOpen(false);

    setEditing(false);

    setFile(null);

    setPreview("");

    setForm(
      emptyForm
    );
  }

  async function loadProjects() {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "furniture_projects"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        );

    if (!error) {
      setProjects(
        data || []
      );
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function openAdd() {
    closeModal();

    setOpen(true);
  }

  function openEdit(
    item: Project
  ) {
    setEditing(true);

    setForm(item);

    setPreview(
      item.thumbnail
    );

    setOpen(true);
  }

  async function save() {
    try {
      setLoading(true);

      let image =
        form.thumbnail;

      if (file) {
        image =
          await uploadImage(
            "project-images",
            file
          );
      }

      const payload = {
        title:
          form.title,

        description:
          form.description,

        price:
          Number(
            form.price
          ),

        difficulty:
          form.difficulty,

        youtube_url:
          form.youtube_url,

        thumbnail:
          image,
      };

      let error;

      if (
        editing &&
        form.id
      ) {
        ({
          error,
        } =
          await supabase
            .from(
              "furniture_projects"
            )
            .update(
              payload
            )
            .eq(
              "id",
              form.id
            ));
      } else {
        ({
          error,
        } =
          await supabase
            .from(
              "furniture_projects"
            )
            .insert(
              payload
            ));
      }

      if (error)
        throw error;

      alert(
        editing
          ? "Updated"
          : "Saved"
      );

      closeModal();

      loadProjects();

    } catch (
      err: any
    ) {
      alert(
        err.message
      );
    } finally {
      setLoading(
        false
      );
    }
  }

  async function deleteProject(
  id?: string
) {
  if (!id) return;

  const confirmDelete =
    confirm(
      "Delete this project?"
    );

  if (
    !confirmDelete
  )
    return;

  try {
    const {
      error,
    } =
      await supabase
        .from(
          "furniture_projects"
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (error)
      throw error;

    setProjects(
      (prev) =>
        prev.filter(
          (x) =>
            x.id !== id
        )
    );

    alert(
      "Deleted"
    );

  } catch (
    err: any
  ) {
    alert(
      err.message
    );
  }
}

  const filtered =
    projects.filter(
      (p) =>
        p.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* HEADER */}

      <div className="flex gap-4 mb-10">

        <input
          value={search}
          onChange={(e)=>
            setSearch(
              e.target.value
            )
          }
          placeholder="Search Project..."
          className="
          flex-1
          p-4
          rounded-2xl
          border
          bg-white
          "
        />

        <button
          onClick={
            openAdd
          }
          className="
          px-8
          rounded-2xl
          bg-black
          text-white
          "
        >
          + Add
        </button>

      </div>

      {/* CARDS */}

      <div className="grid md:grid-cols-3 gap-6">

        {filtered.map(
          (item) => (

            <div
              key={
                item.id
              }
              className="
              bg-white
              rounded-3xl
              overflow-hidden
              shadow
              "
            >

              <img
                src={
                  item.thumbnail ||
                  "/placeholder.jpg"
                }
                className="
                h-60
                w-full
                object-cover
                "
              />

              <div className="p-6">

                <h2 className="text-2xl font-bold">
                  {
                    item.title
                  }
                </h2>

                <p className="text-gray-500">
                  {
                    item.description
                  }
                </p>

                <div
className="
mt-5
flex
gap-3
"
>

<button
onClick={()=>
openEdit(
item
)
}
className="
flex-1
bg-orange-500
text-white
p-3
rounded-xl
"
>

Edit

</button>

<button
onClick={()=>
deleteProject(
item.id
)
}
className="
flex-1
bg-red-500
text-white
p-3
rounded-xl
"
>

Delete

</button>

</div>

              </div>

            </div>

          )
        )}

      </div>

      {/* MODAL */}

      {open && (

        <div
          onClick={
            closeModal
          }
          className="
          fixed
          inset-0
          bg-black/50
          flex
          justify-center
          items-center
          z-50
          "
        >

          <div
            onClick={(e)=>
              e.stopPropagation()
            }
            className="
            relative
            bg-white
            rounded-3xl
            w-[900px]
            p-8
            grid
            md:grid-cols-2
            gap-8
            "
          >

            {/* CLOSE */}

            <button
              onClick={
                closeModal
              }
              className="
              absolute
              right-5
              top-5

              w-10
              h-10

              rounded-full

              bg-gray-100

              hover:bg-red-500
              hover:text-white
              "
            >
              ✕

            </button>

            {/* FORM */}

            <div className="space-y-4">

              <h1 className="text-3xl font-bold">

                {
                  editing
                    ? "Edit"
                    : "Add"
                }

                Project

              </h1>

              <input
                value={
                  form.title
                }
                onChange={(e)=>
                  update(
                    "title",
                    e.target.value
                  )
                }
                placeholder="Title"
                className="w-full p-4 border rounded-xl"
              />

              <textarea
                rows={5}
                value={
                  form.description
                }
                onChange={(e)=>
                  update(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Description"
                className="w-full p-4 border rounded-xl"
              />

              <input
                value={
                  form.price
                }
                onChange={(e)=>
                  update(
                    "price",
                    e.target.value
                  )
                }
                placeholder="Price"
                className="w-full p-4 border rounded-xl"
              />

             <select
value={
form.difficulty
}
onChange={(e)=>
update(
"difficulty",
e.target.value
)
}

className="
w-full
p-4
border
rounded-xl
"
>

<option value="">
Select Difficulty
</option>

<option value="Easy">
Easy
</option>

<option value="Hard">
Hard
</option>

<option value="Difficult">
Difficult
</option>

</select>

              <input
                value={
                  form.youtube_url
                }
                onChange={(e)=>
                  update(
                    "youtube_url",
                    e.target.value
                  )
                }
                placeholder="Youtube"
                className="w-full p-4 border rounded-xl"
              />

              <input
                type="file"
                onChange={(e)=>{

                  const f =
                    e.target
                      .files?.[0];

                  if (
                    f
                  ) {

                    setFile(
                      f
                    );

                    setPreview(
                      URL.createObjectURL(
                        f
                      )
                    );

                  }

                }}className="w-full p-4 border rounded-xl"
              />

              <button
                onClick={
                  save
                }
                className="
                w-full
                bg-black
                text-white
                p-4
                rounded-xl
                "
              >
                {
                  loading
                    ? "Saving..."
                    : "Save"
                }
              </button>

            </div>

            {/* PREVIEW */}

            <div className="rounded-3xl overflow-hidden shadow">

              <img
                src={
                  preview ||
                  form.thumbnail ||
                  "/placeholder.jpg"
                }
                className="
                h-64
                w-full
                object-cover
                "
              />

              <div
className="
p-8
space-y-4
"
>

<h1
className="
text-3xl
font-bold
"
>

{
form.title
||
"Project"
}

</h1>

<p
className="
text-gray-500
"
>

{
form.description
||
"Description"
}

</p>

<div
className="
space-y-3
"
>

<p>

💰 Price:

<b>

₱

{
form.price
||
"0"
}

</b>

</p>

<p>

⚒ Difficulty:

<b>

{
form.difficulty
||
"-"
}

</b>

</p>

<p
className="
break-all
"
>

▶ Youtube:

<br/>

<span
className="
text-blue-600
"
>

{
form.youtube_url
||
"-"
}

</span>

</p>

</div>

</div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}