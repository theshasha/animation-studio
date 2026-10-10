import { createRoot } from "react-dom/client";
import { App } from "@current-project";

const root = document.getElementById("root");
if (!root) throw new Error("未找到网页挂载节点 root");

createRoot(root).render(<App />);
