import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";

async function getUsername() {
  try {
    const db = await getDb();
    const setting = await db.collection("settings").findOne({ key: "github" });
    return String(setting?.username || process.env.GITHUB_USERNAME || "");
  } catch {
    return process.env.GITHUB_USERNAME || "";
  }
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const username = await getUsername();

  if (!token || !username) {
    return NextResponse.json({ username, repos: [], contributions: [], configured: false });
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: `
        query PortfolioGithub($login: String!) {
          user(login: $login) {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name
                  description
                  url
                  stargazerCount
                  primaryLanguage { name }
                }
              }
            }
            contributionsCollection {
              contributionCalendar {
                weeks {
                  contributionDays {
                    date
                    contributionCount
                  }
                }
              }
            }
          }
        }
      `,
      variables: { login: username }
    })
  });

  if (!response.ok) {
    return NextResponse.json({ username, repos: [], contributions: [], configured: true }, { status: 502 });
  }

  const data = await response.json();
  const user = data.data?.user;

  return NextResponse.json({
    username,
    configured: true,
    repos: user?.pinnedItems?.nodes ?? [],
    contributions: user?.contributionsCollection?.contributionCalendar?.weeks?.flatMap(
      (week: { contributionDays: unknown[] }) => week.contributionDays
    ) ?? []
  });
}
