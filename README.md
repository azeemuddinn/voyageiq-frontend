# 🌍 VoyageIQ — Frontend (AI Tourist Assistant)

This is the Next.js frontend repository for **VoyageIQ**, a modern, full-stack Retrieval-Augmented Generation (RAG) web application that acts as an intelligent local guide.

> ⚠️ **Note:** This project requires the backend service to be running. You can find the backend setup and code in the [VoyageIQ Backend Repository](https://github.com/azeemuddinn/voyageiq-backend).

![Status](https://img.shields.io/badge/Status-Active-brightgreen) ![Frontend](https://img.shields.io/badge/Frontend-Next.js-black) ![Styling](https://img.shields.io/badge/Styling-Tailwind_v4-38bdf8)

---

## ✨ Features

* **Dual Knowledge Ingestion:** Upload PDF guidebooks or paste plain text snippets directly into the vector database on the fly.
* **Responsive Mobile Sidebar:** Fully optimized for mobile screens with smooth sliding navigation and backdrop blur.
* **Persistent Theme Engine:** Seamless light/dark mode toggling with preference storage via `localStorage` and Tailwind CSS v4 custom variants.
* **Backend Health & Wake-up Indicator:** Real-time connection status light in the sidebar that handles cloud server cold-starts gracefully.
* **Dynamic Loading Skeletons:** Animated states for document indexing and chat processing.

---

## 🚀 Getting Started

First, ensure you have your backend running (see the [Backend Repo](https://github.com/azeemuddinn/voyageiq-backend)). Then, run the development server:

```bash
npm run dev