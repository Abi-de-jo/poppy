"use client"

export const getState = () => {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem("docmind")
  return data ? JSON.parse(data) : {
    chats: [],
    projects: [],
    documents: [],
    selectedDocuments: []
  }
}

export const saveState = (state: any) => {
  localStorage.setItem("docmind", JSON.stringify(state))
}