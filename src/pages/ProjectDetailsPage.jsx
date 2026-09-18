import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useData } from "../context/DataContext";
import {
  ArrowLeft, ExternalLink, Users, Cpu, Calendar,
  Terminal, Info, ChevronLeft, ChevronRight, CheckCircle2,
  Star, Play, Clock, FileText, Image as ImageIcon,
  Globe, BookOpen, Layers, Code2, Zap, Shield, TrendingUp,
  Mail, X
} from "lucide-react";
import { GithubIcon, InstagramIcon, LinkedinIcon } from "../components/SocialIcons";

/* ─── Tech Icon Mapper ───────────────────────────────────── */
const DI = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";
const SI = "https://cdn.simpleicons.org";

const getTechIcon = (techName) => {
  const t = techName.toLowerCase().replace(/[\s.\-_]/g, "");

  // ── Languages ─────────────────────────────────────────────
  if (t.includes("javascript") || t === "js") return `${DI}/javascript/javascript-original.svg`;
  if (t.includes("typescript") || t === "ts") return `${DI}/typescript/typescript-original.svg`;
  if (t.includes("python")) return `${DI}/python/python-original.svg`;
  if (t.includes("java") && !t.includes("script")) return `${DI}/java/java-original.svg`;
  if (t.includes("kotlin")) return `${DI}/kotlin/kotlin-original.svg`;
  if (t.includes("swift")) return `${DI}/swift/swift-original.svg`;
  if (t.includes("rust")) return `${DI}/rust/rust-original.svg`;
  if (t.includes("golang") || t === "go") return `${DI}/go/go-original.svg`;
  if (t.includes("csharp") || t === "c#") return `${DI}/csharp/csharp-original.svg`;
  if (t.includes("cplusplus") || t === "c++") return `${DI}/cplusplus/cplusplus-original.svg`;
  if (t === "c") return `${DI}/c/c-original.svg`;
  if (t.includes("ruby")) return `${DI}/ruby/ruby-original.svg`;
  if (t.includes("php")) return `${DI}/php/php-original.svg`;
  if (t.includes("scala")) return `${DI}/scala/scala-original.svg`;
  if (t.includes("dart")) return `${DI}/dart/dart-original.svg`;
  if (t.includes("lua")) return `${DI}/lua/lua-original.svg`;
  if (t.includes("perl")) return `${DI}/perl/perl-original.svg`;
  if (t.includes("matlab")) return `${DI}/matlab/matlab-original.svg`;
  if (t.includes("haskell")) return `${DI}/haskell/haskell-original.svg`;
  if (t.includes("elixir")) return `${DI}/elixir/elixir-original.svg`;
  if (t.includes("clojure")) return `${DI}/clojure/clojure-original.svg`;
  if (t === "r") return `${DI}/r/r-original.svg`;
  if (t.includes("bash") || t.includes("shell")) return `${DI}/bash/bash-original.svg`;
  if (t.includes("powershell")) return `${DI}/powershell/powershell-original.svg`;

  // ── Frontend Frameworks / Libraries ───────────────────────
  if (t.includes("react") && !t.includes("native")) return `${DI}/react/react-original.svg`;
  if (t.includes("reactnative")) return `${DI}/react/react-original.svg`;
  if (t.includes("nextjs") || t === "next") return `${DI}/nextjs/nextjs-original.svg`;
  if (t.includes("nuxt")) return `${DI}/nuxtjs/nuxtjs-original.svg`;
  if (t.includes("vue")) return `${DI}/vuejs/vuejs-original.svg`;
  if (t.includes("angular")) return `${DI}/angularjs/angularjs-original.svg`;
  if (t.includes("svelte")) return `${DI}/svelte/svelte-original.svg`;
  if (t.includes("ember")) return `${DI}/ember/ember-original.svg`;
  if (t.includes("backbone")) return `${DI}/backbonejs/backbonejs-original.svg`;
  if (t.includes("jquery")) return `${DI}/jquery/jquery-original.svg`;
  if (t.includes("remix")) return `${SI}/remix/ffffff`;
  if (t.includes("astro")) return `${SI}/astro/ffffff`;
  if (t.includes("solidjs") || t === "solid") return `${SI}/solid/2c4f7c`;
  if (t.includes("qwik")) return `${SI}/qwik/ffffff`;
  if (t.includes("alpine")) return `${SI}/alpinedotjs/77c1d2`;
  if (t.includes("htmx")) return `${SI}/htmx/ffffff`;

  // ── Styling ───────────────────────────────────────────────
  if (t.includes("html")) return `${DI}/html5/html5-original.svg`;
  if (t.includes("css") && !t.includes("bootstrap")) return `${DI}/css3/css3-original.svg`;
  if (t.includes("tailwind")) return `${SI}/tailwindcss/06B6D4`;
  if (t.includes("bootstrap")) return `${DI}/bootstrap/bootstrap-original.svg`;
  if (t.includes("sass") || t.includes("scss")) return `${DI}/sass/sass-original.svg`;
  if (t.includes("less")) return `${DI}/less/less-plain-wordmark.svg`;
  if (t.includes("materialui") || t.includes("mui")) return `${SI}/mui/007FFF`;
  if (t.includes("chakra")) return `${SI}/chakraui/319795`;
  if (t.includes("shadcn")) return `${SI}/shadcnui/ffffff`;
  if (t.includes("antdesign") || t.includes("antd")) return `${SI}/antdesign/0170FE`;
  if (t.includes("styledcomponent")) return `${SI}/styledcomponents/DB7093`;
  if (t.includes("framer")) return `${SI}/framer/0055FF`;
  if (t.includes("radix")) return `${SI}/radixui/161618`;
  if (t.includes("daisyui")) return `${SI}/daisyui/5A0EF8`;

  // ── Backend Frameworks ────────────────────────────────────
  if (t.includes("nodejs") || t.includes("node")) return `${DI}/nodejs/nodejs-original.svg`;
  if (t.includes("express")) return `${DI}/express/express-original.svg`;
  if (t.includes("fastapi")) return `${DI}/fastapi/fastapi-original.svg`;
  if (t.includes("flask")) return `${DI}/flask/flask-original.svg`;
  if (t.includes("django")) return `${DI}/django/django-plain.svg`;
  if (t.includes("rails")) return `${DI}/rails/rails-original-wordmark.svg`;
  if (t.includes("laravel")) return `${DI}/laravel/laravel-original.svg`;
  if (t.includes("nestjs") || t.includes("nest")) return `${DI}/nestjs/nestjs-original.svg`;
  if (t.includes("fastify")) return `${SI}/fastify/ffffff`;
  if (t.includes("hono")) return `${SI}/hono/FF5C00`;
  if (t.includes("spring")) return `${DI}/spring/spring-original.svg`;
  if (t.includes("dotnet") || t === ".net") return `${DI}/dotnetcore/dotnetcore-original.svg`;
  if (t.includes("graphql")) return `${DI}/graphql/graphql-plain.svg`;
  if (t.includes("apollo")) return `${SI}/apollographql/311C87`;
  if (t.includes("trpc")) return `${SI}/trpc/2596BE`;
  if (t.includes("grpc")) return `${SI}/grpc/244c5a`;
  if (t.includes("socket") || t.includes("websocket")) return `${SI}/socketdotio/ffffff`;

  // ── Databases ─────────────────────────────────────────────
  if (t.includes("mongodb") || t.includes("mongo")) return `${DI}/mongodb/mongodb-original.svg`;
  if (t.includes("postgres") || t === "pg") return `${DI}/postgresql/postgresql-original.svg`;
  if (t.includes("mysql")) return `${DI}/mysql/mysql-original.svg`;
  if (t.includes("sqlite")) return `${DI}/sqlite/sqlite-original.svg`;
  if (t.includes("mariadb")) return `${DI}/mariadb/mariadb-original.svg`;
  if (t.includes("mssql") || t.includes("sqlserver")) return `${SI}/microsoftsqlserver/CC2927`;
  if (t.includes("oracle")) return `${DI}/oracle/oracle-original.svg`;
  if (t.includes("redis")) return `${DI}/redis/redis-original.svg`;
  if (t.includes("cassandra")) return `${DI}/cassandra/cassandra-original.svg`;
  if (t.includes("couchdb")) return `${DI}/couchdb/couchdb-original.svg`;
  if (t.includes("neo4j")) return `${DI}/neo4j/neo4j-original.svg`;
  if (t.includes("elasticsearch") || t === "elastic") return `${DI}/elasticsearch/elasticsearch-original.svg`;
  if (t.includes("influxdb")) return `${DI}/influxdb/influxdb-original.svg`;
  if (t.includes("prisma")) return `${SI}/prisma/ffffff`;
  if (t.includes("drizzle")) return `${SI}/drizzle/C5F74F`;
  if (t.includes("sequelize")) return `${DI}/sequelize/sequelize-original.svg`;
  if (t.includes("mongoose")) return `${SI}/mongoose/880000`;
  if (t.includes("supabase")) return `${SI}/supabase/3FCF8E`;
  if (t.includes("planetscale")) return `${SI}/planetscale/ffffff`;
  if (t.includes("neon")) return `${SI}/neon/00E699`;
  if (t.includes("turso")) return `${SI}/turso/4FF8D2`;
  if (t.includes("fauna")) return `${SI}/fauna/3A1AB6`;
  if (t.includes("upstash")) return `${SI}/upstash/00E9A3`;

  // ── Cloud & Hosting ───────────────────────────────────────
  if (t.includes("aws") || t.includes("amazon")) return `${SI}/amazonwebservices/FF9900`;
  if (t.includes("azure")) return `${DI}/azure/azure-original.svg`;
  if (t.includes("gcp") || t.includes("googlecloud")) return `${DI}/googlecloud/googlecloud-original.svg`;
  if (t.includes("firebase")) return `${DI}/firebase/firebase-plain.svg`;
  if (t.includes("vercel")) return `${SI}/vercel/ffffff`;
  if (t.includes("netlify")) return `${SI}/netlify/00C7B7`;
  if (t.includes("heroku")) return `${DI}/heroku/heroku-original.svg`;
  if (t.includes("railway")) return `${SI}/railway/0B0D0E`;
  if (t.includes("render")) return `${SI}/render/46E3B7`;
  if (t.includes("flyio") || t === "fly") return `${SI}/flydotio/7B3BE2`;
  if (t.includes("digitalocean")) return `${DI}/digitalocean/digitalocean-original.svg`;
  if (t.includes("cloudflare")) return `${SI}/cloudflare/F38020`;
  if (t.includes("linode")) return `${SI}/linode/00A95C`;

  // ── DevOps & Infrastructure ───────────────────────────────
  if (t.includes("docker")) return `${DI}/docker/docker-original.svg`;
  if (t.includes("kubernetes") || t === "k8s") return `${DI}/kubernetes/kubernetes-plain.svg`;
  if (t.includes("terraform")) return `${DI}/terraform/terraform-original.svg`;
  if (t.includes("ansible")) return `${DI}/ansible/ansible-original.svg`;
  if (t.includes("jenkins")) return `${DI}/jenkins/jenkins-original.svg`;
  if (t.includes("githubactions")) return `${SI}/githubactions/2088FF`;
  if (t.includes("circleci")) return `${DI}/circleci/circleci-plain.svg`;
  if (t.includes("nginx")) return `${DI}/nginx/nginx-original.svg`;
  if (t.includes("apache")) return `${DI}/apache/apache-original.svg`;
  if (t.includes("prometheus")) return `${DI}/prometheus/prometheus-original.svg`;
  if (t.includes("grafana")) return `${DI}/grafana/grafana-original.svg`;
  if (t.includes("rabbitmq")) return `${DI}/rabbitmq/rabbitmq-original.svg`;
  if (t.includes("kafka")) return `${SI}/apachekafka/ffffff`;

  // ── Mobile ────────────────────────────────────────────────
  if (t.includes("flutter")) return `${DI}/flutter/flutter-original.svg`;
  if (t.includes("android")) return `${DI}/android/android-original.svg`;
  if (t.includes("expo")) return `${SI}/expo/ffffff`;
  if (t.includes("ionic")) return `${DI}/ionic/ionic-original.svg`;
  if (t.includes("xamarin")) return `${DI}/xamarin/xamarin-original.svg`;

  // ── AI / ML ───────────────────────────────────────────────
  if (t.includes("tensorflow")) return `${DI}/tensorflow/tensorflow-original.svg`;
  if (t.includes("pytorch")) return `${DI}/pytorch/pytorch-original.svg`;
  if (t.includes("keras")) return `${DI}/keras/keras-original.svg`;
  if (t.includes("scikitlearn") || t.includes("sklearn")) return `${SI}/scikitlearn/F7931E`;
  if (t.includes("numpy")) return `${DI}/numpy/numpy-original.svg`;
  if (t.includes("pandas")) return `${DI}/pandas/pandas-original.svg`;
  if (t.includes("opencv")) return `${DI}/opencv/opencv-original.svg`;
  if (t.includes("openai")) return `${SI}/openai/ffffff`;
  if (t.includes("langchain")) return `${SI}/langchain/1C3C3C`;
  if (t.includes("huggingface")) return `${SI}/huggingface/FFD21E`;

  // ── Testing ───────────────────────────────────────────────
  if (t.includes("jest")) return `${DI}/jest/jest-plain.svg`;
  if (t.includes("vitest")) return `${SI}/vitest/6E9F18`;
  if (t.includes("cypress")) return `${SI}/cypress/17202C`;
  if (t.includes("playwright")) return `${SI}/playwright/2EAD33`;
  if (t.includes("mocha")) return `${DI}/mocha/mocha-plain.svg`;
  if (t.includes("selenium")) return `${DI}/selenium/selenium-original.svg`;
  if (t.includes("pytest")) return `${SI}/pytest/0A9EDC`;

  // ── Tools & Platforms ─────────────────────────────────────
  if (t.includes("git") && !t.includes("github") && !t.includes("gitlab")) return `${DI}/git/git-original.svg`;
  if (t.includes("github")) return `${SI}/github/ffffff`;
  if (t.includes("gitlab")) return `${DI}/gitlab/gitlab-original.svg`;
  if (t.includes("bitbucket")) return `${DI}/bitbucket/bitbucket-original.svg`;
  if (t.includes("vscode")) return `${DI}/vscode/vscode-original.svg`;
  if (t.includes("webpack")) return `${DI}/webpack/webpack-original.svg`;
  if (t.includes("vite")) return `${SI}/vite/646CFF`;
  if (t.includes("babel")) return `${DI}/babel/babel-original.svg`;
  if (t.includes("eslint")) return `${DI}/eslint/eslint-original.svg`;
  if (t.includes("prettier")) return `${SI}/prettier/F7BA3E`;
  if (t.includes("storybook")) return `${SI}/storybook/FF4785`;
  if (t.includes("figma")) return `${DI}/figma/figma-original.svg`;
  if (t.includes("jira")) return `${DI}/jira/jira-original.svg`;
  if (t.includes("postman")) return `${SI}/postman/FF6C37`;
  if (t.includes("stripe")) return `${SI}/stripe/635BFF`;
  if (t.includes("twilio")) return `${SI}/twilio/F22F46`;
  if (t.includes("linux")) return `${DI}/linux/linux-original.svg`;
  if (t.includes("ubuntu")) return `${DI}/ubuntu/ubuntu-original.svg`;
  if (t.includes("windows")) return `${SI}/windows11/0078D4`;
  if (t.includes("electron")) return `${DI}/electron/electron-original.svg`;
  if (t.includes("bun")) return `${SI}/bun/FBF0DF`;
  if (t.includes("deno")) return `${SI}/deno/ffffff`;
  if (t.includes("tauri")) return `${SI}/tauri/FFC131`;
  if (t.includes("threejs") || t === "three") return `${SI}/threedotjs/ffffff`;
  if (t.includes("d3") || t === "d3js") return `${SI}/d3dotjs/F9A03C`;
  if (t.includes("chartjs")) return `${SI}/chartdotjs/FF6384`;
  if (t.includes("zod")) return `${SI}/zod/3E67B1`;
  if (t.includes("axios")) return `${SI}/axios/5A29E4`;
  if (t.includes("tanstack") || t.includes("reactquery")) return `${SI}/reactquery/FF4154`;

  // ── State Management ──────────────────────────────────────
  if (t.includes("redux")) return `${DI}/redux/redux-original.svg`;
  if (t.includes("zustand")) return `${SI}/zustand/ffffff`;
  if (t.includes("mobx")) return `${SI}/mobx/FF7102`;
  if (t.includes("pinia")) return `${SI}/pinia/FFD859`;
  if (t.includes("recoil")) return `${SI}/recoil/3578E5`;

  // ── Auth & Security ───────────────────────────────────────
  if (t.includes("jwt")) return `${SI}/jsonwebtokens/ffffff`;
  if (t.includes("auth0")) return `${SI}/auth0/EB5424`;
  if (t.includes("clerk")) return `${SI}/clerk/6C47FF`;
  if (t.includes("nextauth")) return `${SI}/nextauth/ffffff`;
  if (t.includes("oauth")) return `${SI}/oauth/000000`;
  if (t.includes("passport")) return `${SI}/passport/34E27A`;

  // ── CMS / E-commerce ──────────────────────────────────────
  if (t.includes("wordpress")) return `${DI}/wordpress/wordpress-original.svg`;
  if (t.includes("shopify")) return `${SI}/shopify/96BF48`;
  if (t.includes("contentful")) return `${SI}/contentful/2478CC`;
  if (t.includes("sanity")) return `${SI}/sanity/F03E2F`;
  if (t.includes("strapi")) return `${SI}/strapi/4945FF`;
  if (t.includes("ghost")) return `${SI}/ghost/15171A`;

  return null;
};


/* ─── Features: section colours ─────────────────────── */
const SECTION_COLORS = [
  "#38BDF8", // sky
  "#A855F7", // violet
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EC4899", // pink
  "#3B82F6", // blue
  "#EF4444", // red
  "#14B8A6", // teal
];

/**
 * parseRichSections(rawText)
 *
 * Accepts a raw string that may be:
 *   a) Markdown style:   ## 🚀 Features\n- item\n- item
 *   b) Emoji-prefix:     🚀 Features\nJWT auth\nRole-based access
 *   c) Compacted blob:   ## Heading - item - item ## Heading2 - item
 *
 * Returns an array of section objects:
 *   { title: string, intro: string, items: string[] }
 *
 * Returns null when there are no headings → caller uses simple card mode.
 */
const EMOJI_HEADING_RE = /^\p{Emoji}/u;

function parseRichSections(rawText) {
  if (!rawText || !rawText.trim()) return null;

  // ── Step 1: Normalise – if there are no real newlines, inject them
  //   before every ## token and before every bullet marker (- / * / •)
  let text = rawText;
  if (!text.includes('\n')) {
    text = text.replace(/(##\s)/g, '\n$1');
    text = text.replace(/\s(-\s|\*\s|•\s)/g, '\n$1');
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // A line is a section heading if it starts with ##/#  OR  starts with an emoji
  const isHeading = (l) =>
    l.startsWith('## ') ||
    l.startsWith('# ') ||
    EMOJI_HEADING_RE.test(l);

  // Quick-exit: no heading found → not rich content
  if (!lines.some(isHeading)) return null;

  const sections = [];
  let current = null;

  for (const line of lines) {
    if (isHeading(line)) {
      // flush previous section
      if (current) sections.push(current);
      // strip leading #s if present, keep rest as title
      current = { title: line.replace(/^#+\s*/, '').trim(), intro: '', items: [] };
    } else if (current) {
      // bullet item (-, *, •) → extract text; otherwise treat as plain item
      const bulletMatch = line.match(/^[-*•]\s+(.*)/);
      if (bulletMatch) {
        current.items.push(bulletMatch[1].trim());
      } else if (!current.intro && current.items.length === 0) {
        // first non-bullet line in a section = intro text
        current.intro = line;
      } else if (line) {
        // treat as a plain item if we're inside a section
        current.items.push(line);
      }
    } else {
      // text before any heading → __intro__ pseudo-section
      if (!sections.length || sections[0]?.title !== '__intro__') {
        sections.unshift({ title: '__intro__', intro: '', items: [] });
      }
      const intro = sections[0];
      const bulletMatch = line.match(/^[-*•]\s+(.*)/);
      if (bulletMatch) {
        intro.items.push(bulletMatch[1].trim());
      } else {
        intro.intro += (intro.intro ? ' ' : '') + line;
      }
    }
  }

  if (current) sections.push(current);

  // If we only ended up with an __intro__ section and no real headings, bail
  const realSections = sections.filter(s => s.title !== '__intro__');
  if (realSections.length === 0) return null;

  return sections;
}

/* ─── Stat Pill ─────────────────────────────────────────── */
function StatPill({ icon: Icon, label, value, color, clickable, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.97 }}
      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl overflow-hidden transition-colors
        bg-[rgba(255,255,255,0.03)] border
        ${clickable
          ? "border-[rgba(236,72,153,0.25)] hover:border-[rgba(236,72,153,0.55)] cursor-pointer"
          : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.14)] cursor-default"
        }`}
      style={{ boxShadow: `0 0 0 0 ${color}00` }}
    >
      {/* animated glow background */}
      <motion.div
        className="absolute inset-0 opacity-0 pointer-events-none"
        whileHover={{ opacity: 1 }}
        style={{ background: `radial-gradient(ellipse at 30% 50%, ${color}12 0%, transparent 70%)` }}
      />

      {/* icon bubble with pulse ring on hover */}
      <motion.div
        className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}18`, border: `1px solid ${color}40` }}
        whileHover={{ boxShadow: `0 0 14px ${color}50` }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          whileHover={{ rotate: clickable ? 0 : 12, scale: 1.15 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </motion.div>
        {/* ping ring */}
        {clickable && (
          <span className="absolute inset-0 rounded-xl animate-ping opacity-20" style={{ backgroundColor: color }} />
        )}
      </motion.div>

      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold truncate">{label}</p>
        <p className={`text-sm font-bold leading-tight flex items-center gap-1 w-full ${clickable ? "text-[#EC4899]" : "text-white"}`}>
          <span className="truncate block w-full">{value}</span>
          {clickable && (
            <motion.span
              className="text-[10px] font-normal opacity-50 ml-1 flex-shrink-0"
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >↓ scroll</motion.span>
          )}
        </p>
      </div>

      {/* bottom shimmer line */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] rounded-full"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
      />
    </motion.div>
  );
}

/* ─── Section Header ─────────────────────────────────────── */
function SectionHeader({ icon: Icon, label, color = "#38BDF8" }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <h2 className="text-lg font-bold text-white font-space">{label}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-[rgba(255,255,255,0.06)] to-transparent" />
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function ProjectDetailsPage() {
  const { id } = useParams();
  const { projects, loadingProjects } = useData();
  const project = projects.find((p) => p.id === Number(id));
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const heroRef = useRef(null);
  const teamRef = useRef(null);
  const scrollToTeam = () => teamRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const [activeTab, setActiveTab] = useState("overview");
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 80]);

  const [githubReadme, setGithubReadme] = useState(null);
  const [isLoadingReadme, setIsLoadingReadme] = useState(false);
  const [slideDir, setSlideDir] = useState(1); // 1=forward, -1=backward

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  useEffect(() => {
    const fetchReadme = async () => {
      if (!project?.architecture && !project?.description && project?.github) {
        setIsLoadingReadme(true);
        try {
          const match = project.github.match(/github\.com\/([^/]+)\/([^/]+)/);
          if (match) {
            const owner = match[1];
            const repo = match[2].replace(/\/$/, '');
            let res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`);
            if (!res.ok) {
              res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`);
            }
            if (res.ok) {
              const text = await res.text();
              setGithubReadme(text);
            }
          }
        } catch (e) {
          console.error("Failed to fetch README", e);
        } finally {
          setIsLoadingReadme(false);
        }
      }
    };
    fetchReadme();
  }, [project]);

  /* ── keyboard navigation ───────────────────────────────── */
  useEffect(() => {
    const imgs = project?.screenshots?.length > 0
      ? project.screenshots
      : project?.image ? [project.image] : [];
    const total = imgs.length || 1;
    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (lightbox !== null) {
        if (e.key === "ArrowRight") {
          setSlideDir(1);
          setLightbox((p) => (p + 1) % total);
          setCurrentImageIndex((p) => (p + 1) % total);
        } else if (e.key === "ArrowLeft") {
          setSlideDir(-1);
          setLightbox((p) => (p - 1 + total) % total);
          setCurrentImageIndex((p) => (p - 1 + total) % total);
        } else if (e.key === "Escape") {
          setLightbox(null);
        }
      } else if (activeTab === "screenshots") {
        if (e.key === "ArrowRight") {
          setSlideDir(1);
          setCurrentImageIndex((p) => (p + 1) % total);
        } else if (e.key === "ArrowLeft") {
          setSlideDir(-1);
          setCurrentImageIndex((p) => (p - 1 + total) % total);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, lightbox, project]);

  if (!project && loadingProjects) {
    return (
      <div className="min-h-screen bg-[#02050D] flex flex-col items-center justify-center text-white px-4">
        <div className="w-10 h-10 rounded-full border-2 border-[#38BDF8] border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-[#94A3B8] font-space tracking-wider animate-pulse">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#02050D] flex flex-col items-center justify-center text-white px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="text-7xl mb-6">🚀</div>
          <h1 className="text-4xl font-space font-bold mb-3">Project Not Found</h1>
          <p className="text-[#64748B] mb-8">The project you're looking for doesn't exist.</p>
          <Link to="/projects" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3B82F6] text-white font-bold hover:bg-[#2563EB] transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Projects
          </Link>
        </motion.div>
      </div>
    );
  }

  const techStack = Array.isArray(project.tech)
    ? project.tech
    : typeof project.tech === "string"
      ? project.tech.split(",").map((t) => t.trim()).filter(Boolean)
      : [];
  const displayImages = project?.screenshots?.length > 0
    ? project.screenshots
    : project?.image ? [project.image, project.image, project.image, project.image] : [];

  const nextImage = () => setCurrentImageIndex((p) => (p + 1) % displayImages.length);
  const prevImage = () => setCurrentImageIndex((p) => (p - 1 + displayImages.length) % displayImages.length);
  const accentColor = project.color || "#3B82F6";

  return (
    <main className="min-h-screen bg-[#02050D] overflow-x-hidden">

      {/* ── LIGHTBOX ─────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.img
              src={displayImages[lightbox]}
              alt="Full view"
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-5xl max-h-[85vh] w-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button onClick={() => setLightbox(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-xl font-bold">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AMBIENT BACKGROUND ───────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-15%] left-[-5%] w-[55%] h-[55%] rounded-full blur-[180px] opacity-[0.06]"
          style={{ backgroundColor: accentColor }}
        />
        <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-[#7C3AED] blur-[150px] opacity-[0.04]" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)`,
          backgroundSize: "40px 40px"
        }} />
      </div>

      {/* ── STICKY NAV BAR ───────────────────────────────── */}
      <div className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.04)] bg-[rgba(2,5,13,0.85)] backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/projects" className="inline-flex items-center gap-2 text-[#94A3B8] text-sm hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Projects</span>
          </Link>
          <div className="flex items-center gap-2">
            {project.demo && (
              <a href={project.demo} target="_blank" rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#3B82F6] text-white hover:bg-[#2563EB] transition-colors">
                <Globe className="w-3 h-3" /> Live Demo
              </a>
            )}
            {project.github && (
              <a href={project.github} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.1)] transition-colors">
                <GithubIcon className="w-3 h-3" /> GitHub
              </a>
            )}

            <div className="relative">
              <button
                onClick={() => setShareOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.3)] text-[#C084FC] hover:bg-[rgba(168,85,247,0.25)] transition-all"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section ref={heroRef} className="relative pt-16 pb-0 overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

            {/* Hero Top Content */}
            <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-16 items-center pb-16">

              {/* Left Text */}
              <motion.div
                initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="min-w-0"
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] mb-6">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                  <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">{Array.isArray(project.projectType) ? project.projectType.join(", ") : (project.projectType || "Project")}</span>
                </div>

                {/* Logo + Title */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 mb-4 sm:mb-5">
                  {project.logo ? (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] p-1.5 sm:p-2 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                      <img src={project.logo} alt={`${project.title} logo`} className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 rounded-2xl flex items-center justify-center border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
                      style={{ boxShadow: `0 0 20px ${accentColor}30` }}>
                      <Cpu className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: accentColor }} />
                    </div>
                  )}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-space font-extrabold text-white leading-tight sm:leading-[1.05] tracking-tight">
                    {project.title}
                  </h1>
                </div>

                <p className="text-sm sm:text-base lg:text-lg text-[#94A3B8] leading-relaxed mb-6 sm:mb-8 max-w-lg">
                  {project.description}
                </p>

                {/* Tech Pills Row */}
                <div className="flex flex-wrap gap-2 mb-8 sm:mb-10">
                  {techStack.slice(0, 6).map((tech, i) => {
                    const icon = getTechIcon(tech);
                    return (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#CBD5E1] hover:border-[rgba(255,255,255,0.18)] transition-all cursor-default">
                        {icon && <img src={icon} alt={tech} className="w-3.5 h-3.5 object-contain" />}
                        {tech}
                      </span>
                    );
                  })}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-2.5 sm:gap-3">
                  <a href={project.demo || "#"} target="_blank" rel="noreferrer"
                    className={`group relative inline-flex items-center gap-2 px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm overflow-hidden transition-all ${project.demo ? "text-white" : "text-[#64748B] cursor-not-allowed opacity-50"}`}
                    style={project.demo ? { background: `linear-gradient(135deg, ${accentColor}, #7C3AED)`, boxShadow: `0 0 30px ${accentColor}40` } : {}}>
                    <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Live Demo
                    <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    {project.demo && <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
                  </a>

                  <a href={project.github || "#"} target="_blank" rel="noreferrer"
                    className={`inline-flex items-center gap-2 px-5 py-3 sm:px-7 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${project.github ? "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]" : "border-[rgba(255,255,255,0.05)] text-[#64748B] cursor-not-allowed opacity-50"}`}>
                    <GithubIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Source Code
                  </a>

                  {project.youtubeUrl && (
                    <a href={project.youtubeUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.15)] transition-all">
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                      Watch Demo
                    </a>
                  )}

                  {project.docsUrl && (
                    <a href={project.docsUrl} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] text-[#10B981] hover:bg-[rgba(16,185,129,0.15)] transition-all">
                      <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Docs
                    </a>
                  )}

                  {/* Share button — hero */}
                  <button
                    onClick={() => setShareOpen(o => !o)}
                    className="inline-flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-[rgba(168,85,247,0.08)] border border-[rgba(168,85,247,0.25)] text-[#C084FC] hover:bg-[rgba(168,85,247,0.15)] transition-all"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    Share
                  </button>
                </div>
              </motion.div>

              {/* Right — Hero Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative"
              >
                {/* Glow orb */}
                <div className="absolute inset-[-20%] rounded-full blur-[100px] opacity-20 pointer-events-none" style={{ backgroundColor: accentColor }} />

                {/* Main Image Frame */}
                <div className="relative rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.1)] shadow-[0_30px_80px_rgba(0,0,0,0.6)] cursor-zoom-in" onClick={() => displayImages.length > 0 && setLightbox(0)}>
                  {/* Browser chrome bar */}
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-[rgba(255,255,255,0.03)] border-b border-[rgba(255,255,255,0.06)]">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <div className="flex-1 mx-4 h-5 rounded bg-[rgba(255,255,255,0.05)] flex items-center px-3">
                      <span className="text-[10px] text-[#64748B] truncate">{project.demo || "https://your-project.vercel.app"}</span>
                    </div>
                  </div>
                  <div className="relative aspect-video bg-[#0A0F1E]">
                    {displayImages[0] ? (
                      <motion.img
                        key={currentImageIndex}
                        src={displayImages[currentImageIndex]}
                        alt="Hero screenshot"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#334155]">
                        <ImageIcon className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.3)] to-transparent pointer-events-none" />
                    {/* Zoom hint */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/50 backdrop-blur-sm text-[10px] text-white/60 font-medium">
                      Click to expand
                    </div>
                  </div>
                </div>



              </motion.div>
            </div>

            {/* ── STATS BAR ──────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[rgba(255,255,255,0.05)] pt-6">
              <StatPill delay={0.42} icon={Layers} label="Project Type" value={Array.isArray(project.projectType) ? project.projectType.join(", ") : (project.projectType || "Personal")} color="#A855F7" />
              {project.team?.length > 0 ? (
                <div onClick={scrollToTeam} className="cursor-pointer">
                  <StatPill delay={0.5} icon={Users} label="Team" value={`${project.team.length} Members`} color="#EC4899" clickable />
                </div>
              ) : (
                <StatPill delay={0.5} icon={Users} label="Team" value="Solo" color="#EC4899" />
              )}
              <StatPill delay={0.58} icon={Calendar} label="Started" value={project.startDate || "—"} color="#38BDF8" />
              <StatPill delay={0.66} icon={Clock} label="Duration" value={project.duration || "Ongoing"} color="#10B981" />
            </div>
          </div>
        </section>

        {/* ── TAB NAV ──────────────────────────────────────── */}
        <div className="sticky top-14 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(2,5,13,0.92)] backdrop-blur-xl">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
              {[
                { id: "overview", label: "Overview", icon: FileText, color: "#38BDF8" },
                { id: "screenshots", label: "Screenshots", icon: ImageIcon, color: "#10B981" },
                { id: "tech", label: "Technology", icon: Cpu, color: "#A855F7" },
                ...(project.notes?.length > 0 ? [{ id: "features", label: "Key Features", icon: Star, color: "#F59E0B" }] : []),
                ...(project.team?.length > 0 ? [{ id: "team", label: "Team", icon: Users, color: "#EC4899" }] : []),
                { id: "links", label: "Links", icon: Zap, color: "#F59E0B" },
                { id: "info", label: "Info", icon: Info, color: "#8B5CF6", className: "lg:hidden" },
              ].map(({ id, label, icon: Icon, color, className = "" }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`relative flex items-center gap-2 px-5 py-2.5 my-1 text-sm font-bold whitespace-nowrap rounded-xl transition-all duration-300 group ${className} ${isActive ? "z-10 scale-[1.02]" : "hover:bg-[rgba(255,255,255,0.04)] opacity-60 hover:opacity-100"}`}
                    style={{ color: isActive ? color : undefined }}
                  >
                    {/* Active tab background pill morph */}
                    {isActive && (
                      <motion.div
                        layoutId="tab-bg"
                        className="absolute inset-0 rounded-xl border pointer-events-none"
                        style={{ 
                          background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`,
                          borderColor: `${color}40`,
                          boxShadow: `0 8px 20px -5px ${color}30`
                        }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}

                    {/* Icon with animation */}
                    <motion.div
                      animate={isActive ? { rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] } : { rotate: 0, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative z-10"
                    >
                      <Icon className="w-4 h-4" />
                    </motion.div>

                    <span className="relative z-10">
                      {label}
                    </span>

                    {/* Badges */}
                    {id === "team" && project.team?.length > 0 && (
                      <motion.span
                        animate={isActive ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                        transition={{ duration: 0.35 }}
                        className="relative z-10 ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black"
                        style={{ backgroundColor: `${color}${isActive ? "30" : "15"}`, color, border: `1px solid ${color}40` }}
                      >
                        {project.team.length}
                      </motion.span>
                    )}
                    {id === "tech" && techStack.length > 0 && (
                      <motion.span
                        animate={isActive ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                        transition={{ duration: 0.35 }}
                        className="relative z-10 ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black"
                        style={{ backgroundColor: `${color}${isActive ? "30" : "15"}`, color, border: `1px solid ${color}40` }}
                      >
                        {techStack.length}
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── TABBED CONTENT ───────────────────────────────── */}
        <section className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-10">
          <div className="grid lg:grid-cols-[1fr_360px] gap-10">

            {/* ── TAB PANELS (LEFT) ─────────────────────────── */}
            <div className="min-w-0">
              <AnimatePresence mode="wait">

                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <div className="relative p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] hover:border-[rgba(56,189,248,0.2)] hover:bg-[rgba(255,255,255,0.03)] hover:shadow-[0_0_30px_rgba(56,189,248,0.05)] transition-all duration-500 min-h-[200px] overflow-hidden group">
                      
                      {/* Active glow accent */}
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[rgba(56,189,248,0.5)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="w-full">
                        {isLoadingReadme ? (
                          <div className="flex flex-col items-center justify-center py-16 gap-4">
                            <div className="w-8 h-8 rounded-full border-2 border-[#38BDF8] border-t-transparent animate-spin"></div>
                            <p className="text-sm text-[#64748B] animate-pulse">Fetching README from GitHub...</p>
                          </div>
                        ) : (
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table: ({node, ...props}) => (
                                <div className="w-full overflow-x-auto my-6 border border-[rgba(255,255,255,0.05)] rounded-xl bg-[rgba(255,255,255,0.01)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                  <table className="w-full text-sm text-left border-collapse" {...props} />
                                </div>
                              ),
                              th: ({node, ...props}) => <th className="p-4 bg-[rgba(255,255,255,0.04)] text-white font-bold border-b border-[rgba(255,255,255,0.1)] whitespace-nowrap" {...props} />,
                              td: ({node, ...props}) => <td className="p-4 border-b border-[rgba(255,255,255,0.05)] text-[#94A3B8] group-hover:bg-[rgba(255,255,255,0.02)] transition-colors whitespace-nowrap" {...props} />,
                              tr: ({node, ...props}) => <tr className="group" {...props} />,
                              a: ({node, ...props}) => <a className="text-[#38BDF8] hover:text-white underline transition-colors" {...props} />,
                              ul: ({node, ...props}) => <ul className="bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 sm:p-5 pl-8 sm:pl-10 mb-6 list-disc marker:text-[#38BDF8] space-y-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="bg-[rgba(255,255,255,0.01)] border border-[rgba(255,255,255,0.05)] rounded-2xl p-4 sm:p-5 pl-8 sm:pl-10 mb-6 list-decimal marker:text-[#38BDF8] space-y-2" {...props} />,
                              li: ({node, ...props}) => <li className="text-white font-medium text-[15px] leading-relaxed" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[#38BDF8] bg-[rgba(56,189,248,0.05)] py-4 px-5 sm:px-6 rounded-r-xl text-[#CBD5E1] my-6 shadow-[inset_0_0_20px_rgba(56,189,248,0.03)] not-italic" {...props} />,
                              h1: ({node, ...props}) => <h1 className="text-2xl sm:text-3xl font-bold font-space text-transparent bg-clip-text bg-gradient-to-r from-white to-[#94A3B8] mb-6 mt-8 tracking-tight" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-xl sm:text-2xl font-bold font-space text-transparent bg-clip-text bg-gradient-to-r from-white to-[#94A3B8] mb-5 mt-8 tracking-tight" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-lg sm:text-xl font-bold font-space text-white mb-4 mt-6" {...props} />,
                              p: ({node, ...props}) => <p className="text-[#94A3B8] leading-relaxed mb-4 text-[15px] sm:text-base break-words" {...props} />,
                              pre: ({node, ...props}) => <pre className="bg-[#0f111a] border border-[rgba(255,255,255,0.1)] rounded-xl p-4 sm:p-5 overflow-x-auto shadow-xl mb-6 [scrollbar-width:thin]" {...props} />,
                              code: ({node, inline, className, children, ...props}) => {
                                const match = /language-(\w+)/.exec(className || '')
                                return inline ? (
                                  <code className="text-[#A855F7] bg-[rgba(168,85,247,0.08)] px-1.5 py-0.5 rounded-md font-mono text-[13px] font-semibold" {...props}>{children}</code>
                                ) : (
                                  <code className="text-[#E2E8F0] font-mono text-[13px] block" {...props}>{children}</code>
                                )
                              },
                              img: ({node, ...props}) => <img className="rounded-xl border border-[rgba(255,255,255,0.1)] max-w-full h-auto my-6" {...props} />
                            }}
                          >
                            {project.architecture || project.description || githubReadme || "*No overview provided.*"}
                          </ReactMarkdown>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* SCREENSHOTS */}
                {activeTab === "screenshots" && (
                  <motion.div key="screenshots" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    {displayImages.length > 0 ? (
                      <div className="space-y-4 sm:space-y-6 max-w-5xl mx-auto">
                        {/* Main large image */}
                        <div className="relative group">
                          {/* Animated background glow */}
                          <div className="absolute -inset-1 bg-gradient-to-r from-[rgba(56,189,248,0.3)] to-[rgba(168,85,247,0.3)] rounded-3xl blur-lg opacity-20 group-hover:opacity-60 transition duration-700 pointer-events-none" />
                          
                          <div
                            className="relative aspect-video rounded-2xl sm:rounded-3xl overflow-hidden border border-[rgba(255,255,255,0.1)] cursor-zoom-in bg-[#0A0F1E] shadow-[0_10px_40px_rgba(0,0,0,0.5)] group-hover:border-[rgba(255,255,255,0.2)] transition-all duration-500"
                            onClick={() => setLightbox(currentImageIndex)}
                          >
                            <AnimatePresence mode="wait" custom={slideDir}>
                              <motion.img
                                key={currentImageIndex}
                                custom={slideDir}
                                src={displayImages[currentImageIndex]}
                                alt="Screenshot"
                                variants={{
                                  enter: (d) => ({ opacity: 0, x: d * 40, scale: 0.98 }),
                                  center: { opacity: 1, x: 0, scale: 1 },
                                  exit: (d) => ({ opacity: 0, x: d * -40, scale: 0.98 }),
                                }}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className="w-full h-full object-cover"
                              />
                            </AnimatePresence>

                            {/* Hover overlay hint */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
                               <div className="bg-black/50 backdrop-blur-md border border-white/20 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-white text-xs sm:text-sm font-bold translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-xl flex items-center gap-2">
                                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                  Click to enlarge
                               </div>
                            </div>

                            {/* Prev / Next arrows */}
                            {displayImages.length > 1 && (
                              <>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSlideDir(-1); setCurrentImageIndex((p) => (p - 1 + displayImages.length) % displayImages.length); }}
                                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110 active:scale-95 shadow-xl"
                                >
                                  <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSlideDir(1); setCurrentImageIndex((p) => (p + 1) % displayImages.length); }}
                                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110 active:scale-95 shadow-xl"
                                >
                                  <ChevronRight className="w-6 h-6" />
                                </button>
                              </>
                            )}

                            {/* Counter */}
                            {displayImages.length > 1 && (
                              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10">
                                <div className="px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs text-white/90 font-bold shadow-lg tracking-wider">
                                  {currentImageIndex + 1} / {displayImages.length}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Thumbnails grid */}
                        {displayImages.length > 1 && (
                          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-3">
                            {displayImages.map((img, idx) => (
                              <div key={idx} onClick={() => setCurrentImageIndex(idx)}
                                className={`aspect-video rounded-xl overflow-hidden border cursor-pointer transition-all ${idx === currentImageIndex ? "border-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.4)] scale-[1.05] z-10 relative" : "border-[rgba(255,255,255,0.06)] opacity-50 hover:opacity-90 hover:scale-105"
                                  }`}>
                                <img src={img} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-[#334155] gap-4 rounded-2xl border border-[rgba(255,255,255,0.04)]">
                        <ImageIcon className="w-12 h-12" />
                        <p className="text-sm">No screenshots available</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TECHNOLOGY */}
                {activeTab === "tech" && (
                  <motion.div key="tech" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    {techStack.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {techStack.map((tech, idx) => {
                          const iconUrl = getTechIcon(tech);
                          return (
                            <motion.div 
                              key={idx} 
                              whileHover={{ y: -4, scale: 1.02 }} 
                              initial={{ opacity: 0, y: 15 }} 
                              animate={{ opacity: 1, y: 0 }} 
                              transition={{ type: "spring", stiffness: 300, delay: idx * 0.04 }}
                              className="group relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-[rgba(255,255,255,0.05)] hover:border-[rgba(168,85,247,0.3)] hover:bg-[rgba(255,255,255,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] transition-all duration-300 overflow-hidden cursor-default"
                            >
                              {/* Glowing background gradient on hover */}
                              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(168,85,247,0.08)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                              
                              {/* Icon Container */}
                              <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.05)] group-hover:bg-[rgba(168,85,247,0.1)] group-hover:border-[rgba(168,85,247,0.2)] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] transition-all duration-300 relative z-10">
                                {iconUrl ? <img src={iconUrl} alt={tech} className="w-5 h-5 sm:w-6 sm:h-6 object-contain group-hover:scale-110 transition-transform duration-300" /> : <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#A855F7] group-hover:scale-110 transition-transform duration-300" />}
                              </div>
                              
                              {/* Text Container */}
                              <div className="flex-1 min-w-0 relative z-10">
                                <span className="block text-[13px] sm:text-sm font-bold text-[#E2E8F0] group-hover:text-white truncate transition-colors duration-300 capitalize">{tech}</span>
                              </div>

                              {/* Subtle side accent line */}
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-[#A855F7] rounded-l-full opacity-0 group-hover:h-8 group-hover:opacity-100 transition-all duration-300" />
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-[#334155] gap-4 rounded-2xl border border-[rgba(255,255,255,0.04)]">
                        <Cpu className="w-12 h-12" />
                        <p className="text-sm">No technologies listed</p>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* KEY FEATURES */}
                {activeTab === "features" && (() => {
                  // Join all notes into one text blob for smart parsing
                  const rawFeatures = (project.notes || []).join('\n');
                  const sections = parseRichSections(rawFeatures);

                  return (
                    <motion.div key="features" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                      {sections ? (
                        // ── RICH SECTION MODE ──────────────────────────────
                        <div className="space-y-4">
                          {sections.map((section, si) => {
                            const color = SECTION_COLORS[si % SECTION_COLORS.length];
                            if (section.title === '__intro__') {
                              return (
                                <div key={si} className="mb-2">
                                  {section.intro && <p className="text-[#94A3B8] leading-relaxed mb-3">{section.intro}</p>}
                                  {section.items.length > 0 && (
                                    <div className="grid sm:grid-cols-2 gap-3">
                                      {section.items.map((item, ii) => (
                                        <motion.div key={ii} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: ii * 0.04 }}
                                          className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                                          <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-[#38BDF8]" />
                                          <span className="text-sm text-[#94A3B8] leading-relaxed">{item}</span>
                                        </motion.div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                            return (
                              <motion.div
                                key={si}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: si * 0.05, duration: 0.35 }}
                                className="rounded-2xl border overflow-hidden group"
                                style={{ borderColor: `${color}25`, background: `linear-gradient(135deg, ${color}08 0%, rgba(2,5,13,0.95) 100%)` }}
                              >
                                {/* Section Header */}
                                <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: `${color}15` }}>
                                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                                    {section.title.match(/^\S+/)?.[0]}
                                  </div>
                                  <h3 className="font-bold text-white text-sm tracking-wide flex-1">{section.title.replace(/^\S+\s*/, '')}</h3>
                                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${color}15`, color }}>
                                    {section.items.length} features
                                  </span>
                                </div>
                                {/* Items Grid */}
                                {section.items.length > 0 && (
                                  <ul className="p-4 grid sm:grid-cols-2 gap-2.5">
                                    {section.items.map((item, ii) => (
                                      <motion.li
                                        key={ii}
                                        initial={{ opacity: 0, x: -6 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: si * 0.05 + ii * 0.03 }}
                                        className="flex items-start gap-2.5 text-sm leading-relaxed group/item"
                                      >
                                        <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 transition-transform group-hover/item:scale-125" style={{ backgroundColor: color, opacity: 0.85 }} />
                                        <span className="text-[#94A3B8] group-hover/item:text-white transition-colors">{item}</span>
                                      </motion.li>
                                    ))}
                                  </ul>
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        // ── SIMPLE CARD MODE (plain notes array) ───────────
                        <div className="grid sm:grid-cols-2 gap-4">
                          {project.notes?.map((note, idx) => (
                            <motion.div key={idx}
                              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                              whileHover={{ x: 6 }}
                              className="flex items-start gap-4 p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(245,158,11,0.25)] hover:bg-[rgba(245,158,11,0.03)] transition-all">
                              <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)]">
                                <CheckCircle2 className="w-4 h-4 text-[#F59E0B]" />
                              </div>
                              <span className="text-sm text-[#94A3B8] leading-relaxed pt-1">{note}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })()}

                {/* TEAM */}
                {activeTab === "team" && (
                  <motion.div key="team" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
                      {project.team?.map((member, idx) => (
                        <motion.div key={idx} whileHover={{ scale: 1.02, y: -4 }}
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.07 }}
                          className="group relative flex flex-col gap-1.5 mx-auto w-full max-w-[290px]">
                          <div className="relative h-[180px] sm:h-[320px] bg-[#0f111a] -skew-x-12 overflow-hidden border border-[rgba(255,255,255,0.05)] group-hover:border-[#ff4500]/30 transition-all duration-500 group-hover:shadow-[0_10px_30px_rgba(255,69,0,0.15)]">
                            <div className="absolute left-0 top-0 bottom-0 w-[4px] group-hover:w-[8px] bg-[#ff4500] z-20 transition-all duration-300" />
                            <div className="absolute inset-0 skew-x-12 scale-[1.15] bg-[#111827] flex items-center justify-center">
                              {member.photo ? (
                                <img src={member.photo} alt={member.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-5xl sm:text-7xl font-black text-white/10">{member.name?.charAt(0) || "?"}</div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#0f111a]/90 via-[#0f111a]/10 to-transparent opacity-70 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" />
                            </div>
                          </div>
                          <div className="relative h-[70px] sm:h-[80px] bg-[#0f111a] -skew-x-12 overflow-hidden border border-[rgba(255,255,255,0.05)] group-hover:border-[#ff4500]/30 transition-all duration-500">
                            <div className="absolute left-0 top-0 bottom-0 w-5 sm:w-8 group-hover:w-7 sm:group-hover:w-10 bg-[#ff4500] transition-all duration-300 z-10" />
                            <div className="absolute inset-0 skew-x-12 flex flex-col justify-center pl-[28px] sm:pl-[52px] group-hover:pl-[34px] sm:group-hover:pl-[60px] pr-2 sm:pr-8 transition-all duration-300 z-20">
                              <h4 className="text-white font-black uppercase italic text-[12px] sm:text-[16px] leading-tight tracking-wider mb-0.5 sm:mb-1 truncate group-hover:text-[#ff4500] transition-colors duration-300">{member.name}</h4>
                              <div className="flex flex-col lg:flex-row lg:items-center justify-between w-full gap-1 lg:gap-0">
                                <p className="text-[#ff4500] group-hover:text-white text-[9px] sm:text-[11px] italic font-bold tracking-widest uppercase truncate mr-2 transition-colors duration-300">{member.role}</p>
                                <div className="flex gap-1.5 sm:gap-2 items-center opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                                  {member.instagram && <a href={member.instagram} target="_blank" rel="noreferrer" className="text-[#94A3B8] hover:text-[#E1306C] hover:scale-125 transition-all"><InstagramIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></a>}
                                  {member.linkedin && <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-[#94A3B8] hover:text-[#0A66C2] hover:scale-125 transition-all"><LinkedinIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></a>}
                                  {member.github && <a href={member.github} target="_blank" rel="noreferrer" className="text-[#94A3B8] hover:text-white hover:scale-125 transition-all"><GithubIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></a>}
                                  {member.email && <a href={`mailto:${member.email}`} className="text-[#94A3B8] hover:text-[#10B981] hover:scale-125 transition-all"><Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5" /></a>}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* LINKS */}
                {activeTab === "links" && (
                  <motion.div key="links" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { href: project.demo, icon: Globe, label: "Live Demo", desc: "View the live production app", color: "#3B82F6", active: !!project.demo },
                        { href: project.github, icon: GithubIcon, label: "GitHub Repo", desc: "Browse the source code on GitHub", color: "#E2E8F0", active: !!project.github },
                        { href: project.youtubeUrl, icon: Play, label: "YouTube Demo", desc: "Watch the video walkthrough", color: "#EF4444", active: !!project.youtubeUrl },
                        { href: project.docsUrl, icon: BookOpen, label: "Documentation", desc: "Read the full documentation", color: "#10B981", active: !!project.docsUrl },
                      ].map(({ href, icon: Icon, label, desc, color, active }) => (
                        <a key={label} href={active ? href : "#"} target={active ? "_blank" : undefined} rel="noreferrer"
                          className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${active
                            ? "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] hover:border-current hover:bg-[rgba(255,255,255,0.04)] cursor-pointer"
                            : "bg-[rgba(255,255,255,0.01)] border-[rgba(255,255,255,0.03)] opacity-40 cursor-not-allowed"
                            }`}
                          style={active ? { "--tw-border-opacity": 1 } : {}}
                        >
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: active ? `${color}15` : "rgba(255,255,255,0.04)", border: `1px solid ${active ? color : "rgba(255,255,255,0.06)"}40` }}>
                            <Icon className="w-5 h-5" style={{ color: active ? color : "#64748B" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">{label}</p>
                            <p className="text-xs text-[#64748B] mt-0.5">{desc}</p>
                          </div>
                          {active && <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color }} />}
                          {!active && <span className="text-[10px] text-[#475569] flex-shrink-0">N/A</span>}
                        </a>
                      ))}

                      {/* Share card */}
                      <button
                        onClick={() => setShareOpen(true)}
                        className="flex items-center gap-4 p-5 rounded-2xl border bg-[rgba(168,85,247,0.04)] border-[rgba(168,85,247,0.15)] hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.08)] cursor-pointer transition-all text-left w-full"
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}>
                          <svg className="w-5 h-5 text-[#C084FC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">Share Project</p>
                          <p className="text-xs text-[#64748B] mt-0.5">Copy link or share on social media</p>
                        </div>
                        <svg className="w-4 h-4 flex-shrink-0 text-[#C084FC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* INFO */}
                {activeTab === "info" && (
                  <motion.div key="info" className="hidden lg:block" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { icon: Layers, label: "Project Type", value: Array.isArray(project.projectType) ? project.projectType.join(", ") : (project.projectType || "Personal"), color: "#A855F7" },
                        { icon: Calendar, label: "Start Date", value: project.startDate || "—", color: "#38BDF8" },
                        { icon: Clock, label: "Duration", value: project.duration || "Ongoing", color: "#10B981" },
                        { icon: Users, label: "Team Size", value: project.team?.length > 0 ? `${project.team.length} Members` : "Solo", color: "#EC4899" },
                        { icon: Globe, label: "Status", value: project.status || "Active", color: "#F59E0B" },
                        { icon: Terminal, label: "Version", value: project.version || "v1.0", color: "#64748B" },
                      ].map(({ icon: Icon, label, value, color }) => (
                        <div key={label} className="flex items-center gap-4 p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-all">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}>
                            <Icon className="w-5 h-5" style={{ color }} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold mb-0.5">{label}</p>
                            <p className="text-sm text-white font-bold">{value}</p>
                          </div>
                        </div>
                      ))}
                      {/* Custom extra info cards */}
                      {(project.extraInfo || []).filter(item => !item.hidden).map((item, idx) => (
                        <div key={`extra-${idx}`} className="flex items-center gap-4 p-5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] transition-all">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
                            <Info className="w-5 h-5" style={{ color: accentColor }} />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold mb-0.5">{item.label}</p>
                            <p className="text-sm text-white font-bold">{item.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ── RIGHT SIDEBAR (always visible on desktop, tab-dependent on mobile) ─────────────── */}
            <div className={`space-y-5 ${activeTab === 'info' ? 'block' : 'hidden lg:block'}`}>

              {/* Project Info Card */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1 }}
                className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] overflow-hidden">
                <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#8B5CF6]" />
                  <span className="text-sm font-bold text-white">Project Info</span>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    { icon: Layers, label: "Type", value: Array.isArray(project.projectType) ? project.projectType.join(", ") : (project.projectType || "Personal"), color: "#A855F7" },
                    { icon: Calendar, label: "Started", value: project.startDate || "—", color: "#38BDF8" },
                    { icon: Clock, label: "Duration", value: project.duration || "Ongoing", color: "#10B981" },
                    { icon: Users, label: "Team", value: project.team?.length > 0 ? `${project.team.length} Members` : "Solo", color: "#EC4899" },
                  ].map(({ icon: Icon, label, value, color }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-semibold">{label}</p>
                        <p className="text-sm text-white font-semibold">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Links Card */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] overflow-hidden">
                <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-sm font-bold text-white">Quick Links</span>
                </div>
                <div className="p-4 space-y-2.5">
                  {[
                    { href: project.demo, icon: Globe, label: "Live Demo", color: "#3B82F6", active: !!project.demo },
                    { href: project.github, icon: GithubIcon, label: "GitHub Repo", color: "#fff", active: !!project.github },
                    { href: project.youtubeUrl, icon: Play, label: "YouTube Demo", color: "#EF4444", active: !!project.youtubeUrl },
                    { href: project.docsUrl, icon: BookOpen, label: "Documentation", color: "#10B981", active: !!project.docsUrl },
                  ].map(({ href, icon: Icon, label, color, active }) => (
                    <a key={label} href={active ? href : "#"} target={active ? "_blank" : undefined} rel="noreferrer"
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${active ? "hover:bg-[rgba(255,255,255,0.05)] cursor-pointer" : "opacity-30 cursor-not-allowed"}`}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
                        <Icon className="w-3.5 h-3.5" style={{ color: active ? color : "#64748B" }} />
                      </div>
                      <span className="text-sm font-medium" style={{ color: active ? "#CBD5E1" : "#64748B" }}>{label}</span>
                      {active && <ExternalLink className="w-3 h-3 text-[#475569] ml-auto" />}
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Premium Glow Card */}
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.3 }}
                className="relative rounded-2xl overflow-hidden border p-6 group"
                style={{ borderColor: `${accentColor}30` }}>
                <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity" style={{ background: `linear-gradient(135deg, ${accentColor}20 0%, #7C3AED15 100%)` }} />
                <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity" style={{ backgroundColor: accentColor }} />
                <div className="relative z-10">
                  <TrendingUp className="w-8 h-8 mb-3" style={{ color: accentColor }} />
                  <p className="text-white font-bold text-base mb-1.5">Interested in this project?</p>
                  <p className="text-[#64748B] text-xs leading-relaxed mb-4">Check out the live version, read the docs, or dive into the source code.</p>
                  {project.demo && (
                    <a href={project.demo} target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full text-white transition-all"
                      style={{ background: `linear-gradient(135deg, ${accentColor}, #7C3AED)` }}>
                      View Live <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </section>



        {/* ── GLOBAL SHARE MODAL (Works everywhere) ──────────────── */}
        <AnimatePresence>
          {shareOpen && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 p-0">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShareOpen(false)}
              />
              {/* Modal Container */}
              <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.95 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.15 }}
                className="relative w-full sm:w-[400px] max-h-[90vh] overflow-y-auto bg-[rgba(10,10,30,0.98)] sm:rounded-2xl rounded-t-3xl border border-[rgba(168,85,247,0.2)] shadow-[0_30px_100px_rgba(0,0,0,0.8)] pb-safe"
              >
                {/* Mobile Drag Handle */}
                <div className="w-full flex justify-center py-3 sm:hidden">
                  <div className="w-12 h-1.5 rounded-full bg-[rgba(255,255,255,0.2)]" />
                </div>

                {/* Header */}
                <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-0.5">Share this project</h3>
                    <p className="text-xs text-[#64748B] truncate max-w-[250px]">{window.location.href}</p>
                  </div>
                  <button onClick={() => setShareOpen(false)} className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] flex items-center justify-center transition-colors">
                    <X className="w-4 h-4 text-[#94A3B8]" />
                  </button>
                </div>

                {/* Copy Link */}
                <div className="p-4 border-b border-[rgba(255,255,255,0.04)]">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] hover:border-[rgba(168,85,247,0.4)] hover:bg-[rgba(168,85,247,0.08)] transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[rgba(168,85,247,0.15)] border border-[rgba(168,85,247,0.25)]">
                      {copied
                        ? <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                        : <svg className="w-5 h-5 text-[#C084FC]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                      }
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-base font-bold text-white">{copied ? 'Link Copied!' : 'Copy Link'}</p>
                      <p className="text-xs text-[#64748B] truncate">Click here to copy the URL to clipboard</p>
                    </div>
                  </button>
                </div>

                {/* Social Share Grid */}
                <div className="p-4 grid grid-cols-4 gap-4">
                  {[
                    {
                      label: 'WhatsApp', color: '#25D366', bg: 'rgba(37,211,102,0.12)',
                      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>,
                      url: () => `https://wa.me/?text=${encodeURIComponent(project.title + ' - Check out this project! ' + window.location.href)}`
                    },
                    {
                      label: 'Facebook', color: '#1877F2', bg: 'rgba(24,119,242,0.12)',
                      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
                      url: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
                    },
                    {
                      label: 'Twitter / X', color: '#000', bg: 'rgba(255,255,255,0.08)',
                      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.858L1.542 2.25h6.774l4.254 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
                      url: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(project.title)}&url=${encodeURIComponent(window.location.href)}`
                    },
                    {
                      label: 'LinkedIn', color: '#0A66C2', bg: 'rgba(10,102,194,0.12)',
                      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
                      url: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`
                    },
                    {
                      label: 'Telegram', color: '#26A5E4', bg: 'rgba(38,165,228,0.12)',
                      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>,
                      url: () => `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(project.title)}`
                    },
                    {
                      label: 'Reddit', color: '#FF4500', bg: 'rgba(255,69,0,0.12)',
                      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" /></svg>,
                      url: () => `https://reddit.com/submit?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(project.title)}`
                    },
                  ].map(({ label, color, bg, icon, url }) => (
                    <a
                      key={label}
                      href={url()}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setShareOpen(false)}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg" style={{ backgroundColor: bg, color }}>
                        {icon}
                      </div>
                      <span className="text-[10px] font-semibold text-[#64748B] group-hover:text-white transition-colors">{label}</span>
                    </a>
                  ))}
                </div>

                {/* Native Share fallback */}
                {typeof navigator.share === 'function' && (
                  <div className="p-4 pt-0">
                    <button
                      onClick={() => {
                        navigator.share({ title: project.title, url: window.location.href });
                        setShareOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.2)] text-[#C084FC] text-sm font-bold hover:bg-[rgba(168,85,247,0.2)] transition-all"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                      More options...
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}