"use client";

import { useEffect, useState } from "react";
import type { SiteContent } from "../lib/content";

type Repo = {
  name: string;
  description?: string;
  url: string;
  stargazerCount: number;
  primaryLanguage?: { name?: string };
};

type Contribution = {
  date: string;
  contributionCount: number;
};

export default function GitHubActivity({ content }: { content: SiteContent["github"] }) {
  const [data, setData] = useState<{ username: string; repos: Repo[]; contributions: Contribution[]; configured: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/github").then((response) => response.json()).then(setData).catch(() => setData(null));
  }, []);

  if (!data?.configured) {
    return null;
  }

  return (
    <section className="section github-section" id="github">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{content.eyebrow}</p>
            <h2>{content.title}</h2>
          </div>
          {data.username ? <a className="text-link" href={`https://github.com/${data.username}`}>{content.linkLabel} <span aria-hidden="true">-&gt;</span></a> : null}
        </div>
        <div className="github-heatmap" aria-label="GitHub contribution heatmap">
          {data.contributions.slice(-98).map((day) => (
            <span
              className={`level-${Math.min(4, day.contributionCount)}`}
              key={day.date}
              title={`${day.date}: ${day.contributionCount} contributions`}
            ></span>
          ))}
        </div>
        <div className="github-repos">
          {data.repos.map((repo) => (
            <article key={repo.url}>
              <h3>{repo.name}</h3>
              <p>{repo.description || repo.primaryLanguage?.name || "Pinned repository"}</p>
              <a href={repo.url}>View Repo</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
