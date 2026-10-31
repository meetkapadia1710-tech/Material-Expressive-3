import { aboutCopy, pageCopy, profile } from "@/content/profile";
import { experience } from "@/content/achievements";
import { skills } from "@/content/skills";
import { Icon } from "@/components/icon";

export function AboutPage({ className = "" }: { className?: string }) {
  const education = profile.education;
  const internships = experience.filter((item) => item.visibility === "public");
  const learning = skills.find((group) => group.id === "learning");

  return <article className={`page-width ${className}`}>
    <header className="about-header">
      <p className="eyebrow">{pageCopy.about.eyebrow}</p><h1>{pageCopy.about.title}</h1>
      <span className="about-header-art" aria-hidden="true"><Icon name="spark" /></span>
    </header>

    <section className="about-bio" id="about-bio" aria-labelledby="about-bio-heading">
      <h2 id="about-bio-heading">{aboutCopy.bioTitle}</h2>
      <p>{aboutCopy.bio}</p>
    </section>

    <div className="about-background-grid">
      <section className="about-education" id="about-education" aria-labelledby="about-education-heading">
        <div className="about-section-heading"><span aria-hidden="true"><Icon name="layers" /></span><h2 id="about-education-heading">{aboutCopy.educationTitle}</h2></div>
        <div className="about-education-card">
          <p className="about-year-range">{education.startYear}–{education.endYear}</p>
          <h3>{education.institution}</h3><p className="about-degree">{education.degree}<span aria-hidden="true"> · </span>{education.field}</p>
          {education.cgpa !== null ? <dl className="about-cgpa"><dt>{aboutCopy.cgpaLabel}</dt><dd>{education.cgpa}{education.cgpaScale !== null ? <span> / {education.cgpaScale}</span> : null}</dd></dl> : null}
        </div>
      </section>

      {internships.length ? <section className="about-experience" id="about-experience" aria-labelledby="about-experience-heading">
        <div className="about-section-heading"><span aria-hidden="true"><Icon name="code" /></span><h2 id="about-experience-heading">{aboutCopy.experienceTitle}</h2></div>
        <div className="about-internships">{internships.map((internship) => <article className="about-internship" key={internship.id}>
          {internship.dateLabel ? <p className="about-internship-date">{internship.dateLabel}</p> : null}
          <h3>{internship.title}</h3>{internship.organization ? <p className="about-organization">{internship.organization}</p> : null}
          {internship.description ? <p className="about-internship-description">{internship.description}</p> : null}
          {internship.documents?.length ? <div className="about-documents"><p>{aboutCopy.documentsLabel}</p><ul>{internship.documents.map((document) => <li key={document.label}>{document.url ? <a href={document.url}>{document.label}<Icon name="arrow-up-right" /></a> : <span>{document.label}</span>}</li>)}</ul></div> : null}
        </article>)}</div>
      </section> : null}
    </div>

    {profile.campus.length ? <section className="about-campus" id="about-campus" aria-labelledby="about-campus-heading">
      <div className="about-section-heading"><span aria-hidden="true"><Icon name="spark" /></span><h2 id="about-campus-heading">{aboutCopy.campusTitle}</h2></div>
      <ul>{profile.campus.map((community) => <li key={community}><span aria-hidden="true">✳</span>{community}</li>)}</ul>
    </section> : null}

    <div className="about-learning-grid">
      {learning?.items.length ? <section className="about-learning" id="about-learning" aria-labelledby="about-learning-heading">
        <h2 id="about-learning-heading">{aboutCopy.learningTitle}</h2><ul>{learning.items.map((topic) => <li key={topic}><Icon name="arrow-up-right" />{topic}</li>)}</ul>
        {learning.note ? <p className="about-learning-note">{learning.note}</p> : null}
      </section> : null}
      {aboutCopy.exploreNext.length ? <section className="about-next" id="about-next" aria-labelledby="about-next-heading">
        <h2 id="about-next-heading">{aboutCopy.nextTitle}</h2><ul>{aboutCopy.exploreNext.map((topic) => <li key={topic}><Icon name="arrow-up-right" />{topic}</li>)}</ul>
      </section> : null}
    </div>
  </article>;
}
