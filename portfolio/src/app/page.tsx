import { MatrixIntro } from "@/components/MatrixIntro";

export default function Home() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
          Chirag Dabhere
        </h1>
        <p className="mt-4 max-w-xl text-center text-lg text-neutral-400">
          Full Stack Developer &amp; Machine Learning Enthusiast
        </p>
        <div className="mt-8 flex gap-4">
          <a
            href="https://github.com/Chiragd42"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-neutral-700 px-6 py-2 text-sm text-white transition hover:bg-white hover:text-black"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/chirag-dabhere-7261251ba"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-6 py-2 text-sm text-black transition hover:bg-neutral-200"
          >
            LinkedIn
          </a>
        </div>
      </section>

      {/* About Section */}
      <section className="mx-auto max-w-3xl px-6 py-24">
        <h2 className="text-3xl font-semibold text-white">About Me</h2>
        <p className="mt-4 text-neutral-400 leading-relaxed">
          I am a full stack developer and machine learning enthusiast with
          hands-on experience across multiple technologies. I enjoy building
          things that live on the internet and exploring the boundaries of AI.
        </p>
      </section>

      {/* Skills Section */}
      <section className="mx-auto max-w-3xl px-6 py-24 border-t border-neutral-800">
        <h2 className="text-3xl font-semibold text-white">Skills</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {[
            { title: "Web Development", items: "HTML, CSS, JavaScript, Node.js, Express.js, React, Next.js" },
            { title: "Programming", items: "C++, Python, TypeScript" },
            { title: "Machine Learning", items: "Neural Networks, Deep Learning" },
            { title: "Databases", items: "SQL, MongoDB" },
          ].map((skill) => (
            <div key={skill.title} className="rounded-xl border border-neutral-800 p-5">
              <h3 className="text-lg font-medium text-white">{skill.title}</h3>
              <p className="mt-2 text-sm text-neutral-500">{skill.items}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Matrix Intro */}
      <MatrixIntro />
    </div>
  );
}
