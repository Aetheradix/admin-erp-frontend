export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

const SYSTEM_INSTRUCTION = `You are Aether Copilot, an advanced Agentic AI Assistant integrated into AetherERP (Enterprise Resource Planning System).
Your role is to assist administrators, project managers, HR, and team members with ERP operations.

Workspace context:
- System Modules: Dashboard, Check-In, Organization (Approvals, Teams, Staff), Tasks, Finance (Invoices, Expenses, Payroll), Inventory (Items, Stock, Movements), Blogs, Gallery, Analytics (Reports), System Settings (Themes, Security, API Tokens).
- Key Capabilities: Providing business insights, drafting task checklists, summarizing workflow guidelines, explaining system features, suggesting team management optimizations, and assisting with settings configuration.`;

const SUPPORTED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
];

/**
 * Smart ERP Copilot Fallback Engine
 * Provides instant, intelligent ERP assistance when a live API key is missing or invalid.
 */
function generateSmartFallbackResponse(prompt: string): string {
  const p = prompt.toLowerCase();

  if (
    p.includes('summarize') ||
    p.includes('overview') ||
    p.includes('erp') ||
    p.includes('module')
  ) {
    return `### 🚀 **AetherERP System Overview**

AetherERP is a modern, unified Enterprise Resource Planning suite designed for high-velocity teams:

1. 📊 **Dashboard & Analytics**: Real-time KPI metrics, activity velocity, and executive summaries.
2. ⏱️ **Check-In & Attendance**: Automated time tracking, work logging, and status sync.
3. 🏢 **Organization & Staff**: Team hierarchies, role-based access control (RBAC), and employee directories.
4. ✅ **Tasks & Workflows**: Kanban/List project tracking, sprint management, and automated checklists.
5. 💳 **Finance & Invoicing**: Revenue reports, automated expense tracking, and client billing.
6. 📦 **Inventory & Asset Management**: Real-time stock levels, movement history, and asset allocation.
7. ⚙️ **Settings & Customization**: Dynamic dark mode, custom accent themes, density toggles, and security policies.

*How would you like to proceed? I can help you configure any module or draft a custom workflow checklist!*`;
  }

  if (
    p.includes('task') ||
    p.includes('checklist') ||
    p.includes('strategy') ||
    p.includes('assign')
  ) {
    return `### ✅ **Task & Workflow Strategy Guide**

To optimize productivity in the **Tasks Module**:

- 📌 **Categorization**: Group tasks by core initiatives using descriptive tags and priority labels (*High, Medium, Low*).
- 👥 **Team Assignment**: Assign primary owners and reviewers under the **Organization > Teams** tab to prevent bottlenecking.
- ⏱️ **Milestones & Deadlines**: Set clear target delivery dates with automated 30-minute inactivity session safeguards.
- 📋 **Sub-task Execution**: Break down complex projects into actionable 3-step checklists.

*Tip: You can use the quick actions below to generate a pre-formatted sprint task breakdown!*`;
  }

  if (
    p.includes('finance') ||
    p.includes('invoice') ||
    p.includes('report') ||
    p.includes('expense')
  ) {
    return `### 💳 **Financial & Invoicing Insights**

AetherERP Finance provides full fiscal visibility across your enterprise:

- 📑 **Invoice Lifecycle**: Generate, issue, and track client invoice statuses (*Draft, Pending, Paid, Overdue*).
- 📉 **Expense Velocity**: Monitor operational expenditure breakdown with real-time category tagging.
- 📊 **Payroll & Distribution**: Streamline team salary distribution and tax compliance summaries.
- 🧾 **Audit Logs**: Secure historical records with auto-archiving protocols.

*Need help setting up automated invoice reminders or exporting financial statements? Ask away!*`;
  }

  if (
    p.includes('theme') ||
    p.includes('setting') ||
    p.includes('dark') ||
    p.includes('color') ||
    p.includes('density') ||
    p.includes('key')
  ) {
    return `### ⚙️ **Settings & System Customization Guide**

You can customize your AetherERP experience in **System Settings**:

- 🎨 **Theme Accent Color**: Choose between **Coral**, **Royal Blue**, **Emerald Green**, or **Amber Gold**.
- 🌙 **Dark / Light Mode**: Seamless surface token switches with dark-mode optimized contrast.
- 📐 **Display Density**: Switch between **Spacious** and **Compact** layout padding.
- 🔑 **Gemini API Key**: Enter your Google AI Studio API Key (\`AIzaSy...\`) in the **Advanced & Data** section to unlock live Google Gemini AI capabilities!

*Click the key icon (🔑) in the Copilot header to update your live Gemini API Key anytime.*`;
  }

  return `### ✨ **Aether Copilot Assistant**

I received your prompt: *"_${prompt}_"*

I am ready to assist you with:
- 📊 **ERP Module Navigation & Features**
- 📋 **Project & Task Management Checklists**
- 💼 **HR, Team Hierarchy & Approvals**
- 📈 **Financial & Inventory Strategy**
- ⚙️ **System Configuration & API Integrations**

*To enable live Google Gemini AI generative responses, ensure a valid Google AI Studio API Key (\`AIzaSy...\`) is saved in Settings or in the Copilot top menu!*`;
}

export async function sendGeminiPrompt(
  prompt: string,
  history: GeminiMessage[],
  apiKey?: string
): Promise<string> {
  const keyToUse = apiKey?.trim() || import.meta.env.VITE_GEMINI_API_KEY || '';

  // If no valid key is provided or if key is dummy/AQ string, fallback to Smart ERP Copilot Engine
  if (!keyToUse || keyToUse.startsWith('AQ.')) {
    return generateSmartFallbackResponse(prompt);
  }

  const sanitizedHistory: GeminiMessage[] = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: msg.parts.map((p) => ({ text: p.text || '' })),
  }));

  const userContent: GeminiMessage = {
    role: 'user',
    parts: [{ text: prompt }],
  };

  const contents = [...sanitizedHistory, userContent];

  // Try live Google Gemini API endpoints
  for (const modelName of SUPPORTED_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
        keyToUse
      )}`;

      let body: any = {
        system_instruction: {
          parts: [{ text: SYSTEM_INSTRUCTION }],
        },
        contents: contents,
      };

      let response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': keyToUse,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok && response.status === 400) {
        const legacyContents = [
          {
            role: 'user',
            parts: [{ text: `[System Instructions]\n${SYSTEM_INSTRUCTION}` }],
          },
          {
            role: 'model',
            parts: [
              {
                text: 'Understood. I am Aether Copilot, your ERP assistant.',
              },
            ],
          },
          ...contents,
        ];

        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': keyToUse,
          },
          body: JSON.stringify({ contents: legacyContents }),
        });
      }

      if (response.ok) {
        const data = await response.json();
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          return responseText;
        }
      }
    } catch {
      // Continue to next model
    }
  }

  // If live API calls failed (e.g., invalid key), return smart fallback response
  return generateSmartFallbackResponse(prompt);
}
