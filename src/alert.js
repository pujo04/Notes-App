import Swal from "sweetalert2";

function getThemeColors() {
  const isDark =
    document.documentElement.getAttribute("data-theme") === "dark";
  return {
    bg: isDark ? "#1E293B" : "#ffffff",
    text: isDark ? "#F1F5F9" : "#1E293B",
    subtext: isDark ? "#94A3B8" : "#64748B",
  };
}

export const showAlert = {
  success: (message) => {
    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: message,
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
      background: "#10B981",
      color: "#ffffff",
      iconColor: "#ffffff",
      customClass: {
        popup: "colored-toast",
        title: "colored-toast-title",
        content: "colored-toast-content",
      },
    });
  },

  error: (message) => {
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: message,
      timer: 3000,
      showConfirmButton: false,
      toast: true,
      position: "top-end",
      background: "#EF4444",
      color: "#ffffff",
      iconColor: "#ffffff",
      customClass: {
        popup: "colored-toast",
        title: "colored-toast-title",
        content: "colored-toast-content",
      },
    });
  },

  confirm: async (message) => {
    const theme = getThemeColors();
    const result = await Swal.fire({
      icon: "question",
      title: "Konfirmasi",
      text: message,
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#6366F1",
      cancelButtonColor: "#64748B",
      background: theme.bg,
      color: theme.text,
      iconColor: "#6366F1",
      customClass: {
        popup: "custom-popup",
        title: "custom-title",
        content: "custom-content",
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-cancel-button",
      },
    });
    return result.isConfirmed;
  },

  loading: () => {
    const theme = getThemeColors();
    Swal.fire({
      title: "Mohon tunggu...",
      allowOutsideClick: false,
      showConfirmButton: false,
      background: theme.bg,
      color: theme.subtext,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: "loading-popup",
        title: "loading-title",
      },
    });
  },

  close: () => {
    Swal.close();
  },
};

const style = document.createElement("style");
style.textContent = `
  .colored-toast {
    border-radius: 12px !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
    font-family: 'Inter', sans-serif !important;
  }

  .colored-toast-title {
    font-size: 0.95rem !important;
    font-weight: 600 !important;
    margin-bottom: 2px !important;
  }

  .colored-toast-content {
    font-size: 0.8125rem !important;
  }

  .custom-popup {
    border-radius: 16px !important;
    box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
    padding: 28px !important;
    font-family: 'Inter', sans-serif !important;
  }

  .custom-title {
    font-size: 1.25rem !important;
    font-weight: 600 !important;
    margin-bottom: 8px !important;
  }

  .custom-content {
    font-size: 0.9375rem !important;
  }

  .custom-confirm-button, .custom-cancel-button {
    padding: 10px 24px !important;
    font-size: 0.875rem !important;
    font-weight: 600 !important;
    border-radius: 10px !important;
    font-family: 'Inter', sans-serif !important;
    transition: transform 0.2s ease, box-shadow 0.2s ease !important;
  }

  .custom-confirm-button:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35) !important;
  }

  .custom-cancel-button:hover {
    transform: translateY(-1px) !important;
  }

  .loading-popup {
    border-radius: 16px !important;
    padding: 28px !important;
    font-family: 'Inter', sans-serif !important;
    box-shadow: 0 12px 40px rgba(0,0,0,0.1) !important;
  }

  .loading-title {
    font-size: 1rem !important;
    font-weight: 500 !important;
    margin-top: 8px !important;
  }

  .swal2-loader {
    border-color: #6366F1 transparent #6366F1 transparent !important;
  }
`;

document.head.appendChild(style);
