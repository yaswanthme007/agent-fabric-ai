import { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextType {
  authModalOpen: boolean;
  authModalMode: "signin" | "signup";
  setAuthModalOpen: (open: boolean) => void;
  openAuthModal: (mode?: "signin" | "signup") => void;
  
  apiKeyModalOpen: boolean;
  setApiKeyModalOpen: (open: boolean) => void;
  openApiKeyModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");
  
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const openAuthModal = (mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const openApiKeyModal = () => {
    setApiKeyModalOpen(true);
  };

  return (
    <ModalContext.Provider
      value={{
        authModalOpen,
        authModalMode,
        setAuthModalOpen,
        openAuthModal,
        apiKeyModalOpen,
        setApiKeyModalOpen,
        openApiKeyModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
