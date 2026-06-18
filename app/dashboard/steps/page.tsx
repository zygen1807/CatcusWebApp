"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/services/uploadImage";

type Project = {
  id: string;
  title: string;
  thumbnail?: string;
};

type Step = {
  id?: string;
  project_id: string;
  step_no: number;
  title: string;
  instruction: string;
  image_url?: string;
};

export default function Steps() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);

  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [stepNo, setStepNo] = useState("");
  const [title, setTitle] = useState("");
  const [instruction, setInstruction] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: projectsData }, { data: stepsData }] = await Promise.all([
      supabase.from("furniture_projects").select("*"),
      supabase.from("project_steps").select("*"),
    ]);

    setProjects(projectsData || []);
    setSteps(stepsData || []);
  }

  function getStepsByProject(id: string) {
    return steps.filter((s) => s.project_id === id);
  }

  function hasSteps(id: string) {
    return getStepsByProject(id).length > 0;
  }

  function openModal(project: Project) {
    setSelectedProject(project);
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setSelectedProject(null);
    setStepNo("");
    setTitle("");
    setInstruction("");
    setFile(null);
  }

  async function saveStep() {
    if (!selectedProject) return;

    let image = "";

    if (file) {
      image = await uploadImage("step-images", file);
    }

    const { error } = await supabase.from("project_steps").insert({
      project_id: selectedProject.id,
      step_no: Number(stepNo),
      title,
      instruction,
      image_url: image,
    });

    if (error) return alert(error.message);

    alert("Step Added");
    closeModal();
    loadData();
  }

  const noStepsProjects = projects.filter((p) => !hasSteps(p.id));
  const withStepsProjects = projects.filter((p) => hasSteps(p.id));

  return (
    <div className="min-h-screen bg-gray-50 p-8">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">📁 New Projects</h1>

      {/* NO STEPS PROJECTS */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {noStepsProjects.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl shadow overflow-hidden">
            <img
              src={p.thumbnail || "/placeholder.jpg"}
              className="h-48 w-full object-cover"
            />

            <div className="p-5">
              <h2 className="text-xl font-bold">{p.title}</h2>

              <button
                onClick={() => openModal(p)}
                className="mt-4 w-full bg-black text-white p-3 rounded-xl"
              >
                + Add Steps
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* WITH STEPS */}
      <h1 className="text-3xl font-bold mb-6">🧱 Projects with Steps</h1>

      <div className="space-y-6">
        {withStepsProjects.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl shadow p-6">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{p.title}</h2>

              <button
                onClick={() => openModal(p)}
                className="bg-orange-500 text-white px-5 py-2 rounded-xl"
              >
                + Add/Edit Steps
              </button>
            </div>

            {/* STEPS LIST */}
            <div className="grid md:grid-cols-2 gap-4">
              {getStepsByProject(p.id).map((s) => (
                <div
                  key={s.id}
                  className="border rounded-2xl p-4 bg-gray-50"
                >
                  <div className="flex justify-between">
                    <h3 className="font-bold">
                      Step {s.step_no}: {s.title}
                    </h3>
                  </div>

                  <p className="text-gray-500 text-sm mt-2">
                    {s.instruction}
                  </p>

                  {s.image_url && (
                    <img
                      src={s.image_url}
                      className="mt-3 rounded-xl h-40 w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {open && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-[500px] rounded-3xl p-6 relative"
          >

            <button
              onClick={closeModal}
              className="absolute right-4 top-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-red-500 hover:text-white"
            >
              ✕
            </button>

            <h1 className="text-2xl font-bold mb-4">
              Add Step - {selectedProject?.title}
            </h1>

            <input
              placeholder="Step Number"
              value={stepNo}
              onChange={(e) => setStepNo(e.target.value)}
              className="w-full p-3 border rounded-xl mb-3"
            />

            <input
              placeholder="Step Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border rounded-xl mb-3"
            />

            <textarea
              placeholder="Instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full p-3 border rounded-xl mb-3"
            />

            <input
              type="file"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
              className="w-full mb-4"
            />

            {/* SAVE BUTTON BOTTOM RIGHT */}
            <div className="flex justify-end">
              <button
                onClick={saveStep}
                className="bg-black text-white px-6 py-3 rounded-xl"
              >
                Save Step
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}