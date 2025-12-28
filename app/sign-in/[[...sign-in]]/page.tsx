import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto w-full max-w-md",
            card: "bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700 rounded-xl p-6 shadow-xl",
            headerTitle:
              "text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent",
            headerSubtitle: "text-gray-300",
            formFieldInput:
              "w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all",
            formFieldLabel: "block text-sm font-medium text-gray-100 mb-2",
            formFieldErrorText: "text-red-400 text-sm",
            formFieldSuccessText: "text-green-400 text-sm",
            formButtonPrimary:
              "w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all hover:shadow-lg",
            formButtonSecondary:
              "w-full px-6 py-3 bg-gray-800 border border-gray-700 text-gray-100 rounded-xl font-medium hover:bg-gray-700 transition-all",
            socialButtonsBlockButton:
              "bg-gray-800/50 border border-gray-700 rounded-xl hover:bg-gray-700 transition-colors text-gray-100",
            socialButtonsBlockButtonText: "text-gray-100",
            socialButtonsBlockButtonArrow: "text-gray-300",
            socialButtonsIconButton: "border-gray-700 hover:bg-gray-800",
            footerActionText: "text-sm text-gray-400",
            footerActionLink:
              "text-blue-400 hover:text-blue-300 hover:underline text-sm",
            dividerLine: "bg-gray-700",
            dividerText: "text-gray-400 text-xs",
            identityPreviewText: "text-gray-100",
            identityPreviewEditButton: "text-blue-400 hover:text-blue-300",
            alert: "bg-gray-800 border border-gray-700 text-gray-100",
            alertText: "text-gray-100",
            otpCodeFieldInput:
              "bg-gray-800 border border-gray-700 text-gray-100 focus:border-blue-500",
          },
          variables: {
            colorPrimary: "#3b82f6", // blue-500
            colorText: "#f3f4f6", // gray-100
            colorTextSecondary: "#9ca3af", // gray-400
            colorTextOnPrimaryBackground: "#ffffff", // white
            colorBackground: "#0f172a", // gray-950
            colorInputBackground: "#1f2937", // gray-800
            colorInputText: "#f3f4f6", // gray-100
            colorBorder: "#374151", // gray-700
            colorShimmer: "rgba(59, 130, 246, 0.1)", // blue-500 with opacity
            colorDanger: "#ef4444", // red-500
            colorSuccess: "#10b981", // green-500
            colorWarning: "#f59e0b", // amber-500
          },
          layout: {
            logoPlacement: "inside",
            socialButtonsPlacement: "bottom",
            socialButtonsVariant: "blockButton",
            showOptionalFields: false,
          },
        }}
        routing="path"
        path="/sign-in"
        redirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
    </div>
  );
}
