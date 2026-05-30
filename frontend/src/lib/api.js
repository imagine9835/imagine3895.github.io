import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const fetchPhotos = async (params = {}) => {
  const res = await api.get("/photos", { params });
  return res.data;
};

export const adminVerify = async (key) => {
  const res = await api.post("/admin/verify", { key });
  return res.data;
};

export const createPhoto = async (key, payload) => {
  const res = await api.post("/photos", payload, {
    headers: { "X-Admin-Key": key },
  });
  return res.data;
};

export const deletePhoto = async (key, id) => {
  const res = await api.delete(`/photos/${id}`, {
    headers: { "X-Admin-Key": key },
  });
  return res.data;
};

export const updatePhoto = async (key, id, payload) => {
  const res = await api.patch(`/photos/${id}`, payload, {
    headers: { "X-Admin-Key": key },
  });
  return res.data;
};

export const CATEGORIES = [
  { key: "portrait", label: "Portrait" },
  { key: "editorial", label: "Editorial" },
  { key: "street", label: "Street" },
  { key: "sports", label: "Sports" },
  { key: "events", label: "Events" },
];
