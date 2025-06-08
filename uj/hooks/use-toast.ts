import React from "react";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "success" | "danger" | "warning";
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = React.useState<(ToastOptions & { id: string })[]>([]);

  const toast = React.useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = {
      ...options,
      id,
      variant: options.variant || "default",
      duration: options.duration || 3000
    };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-dismiss after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, newToast.duration);
    
    return id;
  }, []);

  const dismissToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Render toast component
  React.useEffect(() => {
    if (toasts.length > 0) {
      // Create toast container if it doesn't exist
      let container = document.getElementById("toast-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className = "fixed top-4 right-4 z-50 flex flex-col gap-2";
        document.body.appendChild(container);
      }
      
      // Render toasts
      const toastElements = toasts.map(t => {
        const toastElement = document.createElement("div");
        toastElement.id = `toast-${t.id}`;
        toastElement.className = `bg-content1 border shadow-md rounded-lg p-4 min-w-[300px] max-w-[400px] animate-slideIn ${
          t.variant === "success" ? "border-success" : 
          t.variant === "danger" ? "border-danger" :
          t.variant === "warning" ? "border-warning" :
          "border-default-200"
        }`;
        
        toastElement.innerHTML = `
          <div class="flex items-start gap-2">
            <div class="flex-1">
              <h4 class="font-medium text-foreground">${t.title}</h4>
              ${t.description ? `<p class="text-sm text-default-500">${t.description}</p>` : ""}
            </div>
            <button class="text-default-400 hover:text-default-600" aria-label="Close toast">
              &times;
            </button>
          </div>
        `;
        
        // Add click handler to close button
        const closeButton = toastElement.querySelector("button");
        if (closeButton) {
          closeButton.addEventListener("click", () => {
            dismissToast(t.id);
          });
        }
        
        return toastElement;
      });
      
      // Update container
      container.innerHTML = "";
      toastElements.forEach(el => container.appendChild(el));
      
      // Cleanup
      return () => {
        toastElements.forEach(el => {
          const closeButton = el.querySelector("button");
          if (closeButton) {
            closeButton.removeEventListener("click", () => {
              dismissToast(el.id.replace("toast-", ""));
            });
          }
        });
      };
    }
  }, [toasts, dismissToast]);

  return { toast, dismissToast };
};