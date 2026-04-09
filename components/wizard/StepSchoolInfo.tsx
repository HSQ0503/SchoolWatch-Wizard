import type { WizardFormData } from "@/lib/types";

type StepProps = { data: WizardFormData; onChange: (data: WizardFormData) => void };

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black";

const labelClass = "block text-sm font-medium text-gray-700 mb-1";

export default function StepSchoolInfo({ data, onChange }: StepProps) {
  const school = data.school;

  function updateSchool(patch: Partial<WizardFormData["school"]>) {
    onChange({ ...data, school: { ...school, ...patch } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">School Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Basic details about your school and the app you're setting up.
        </p>
      </div>

      {/* Identity */}
      <div className="space-y-4">
        <div>
          <label className={labelClass}>School Name (full)</label>
          <input
            className={inputClass}
            type="text"
            placeholder="Windermere Preparatory School"
            value={school.name}
            onChange={(e) => updateSchool({ name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Short Name</label>
            <input
              className={inputClass}
              type="text"
              placeholder="Windermere Prep"
              value={school.shortName}
              onChange={(e) => updateSchool({ shortName: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Acronym (max 4)</label>
            <input
              className={inputClass}
              type="text"
              placeholder="WPS"
              maxLength={4}
              value={school.acronym}
              onChange={(e) => updateSchool({ acronym: e.target.value.toUpperCase() })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Mascot</label>
            <input
              className={inputClass}
              type="text"
              placeholder="Lakers"
              value={school.mascot}
              onChange={(e) => updateSchool({ mascot: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>App Name</label>
            <input
              className={inputClass}
              type="text"
              placeholder="LakerWatch"
              value={school.appName}
              onChange={(e) => updateSchool({ appName: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Location</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>City</label>
            <input
              className={inputClass}
              type="text"
              placeholder="Orlando"
              value={school.city}
              onChange={(e) => updateSchool({ city: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input
              className={inputClass}
              type="text"
              placeholder="Florida"
              value={school.state}
              onChange={(e) => updateSchool({ state: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>State Code (max 2)</label>
            <input
              className={inputClass}
              type="text"
              placeholder="FL"
              maxLength={2}
              value={school.stateCode}
              onChange={(e) => updateSchool({ stateCode: e.target.value.toUpperCase() })}
            />
          </div>
          <div>
            <label className={labelClass}>Academic Year</label>
            <input
              className={inputClass}
              type="text"
              placeholder="2025–2026"
              value={school.academicYear}
              onChange={(e) => updateSchool({ academicYear: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Contact</h3>
        <div>
          <label className={labelClass}>Contact Email</label>
          <input
            className={inputClass}
            type="email"
            placeholder="admin@school.edu"
            value={data.contactEmail}
            onChange={(e) => onChange({ ...data, contactEmail: e.target.value })}
          />
          <p className="mt-1.5 text-xs text-gray-400">
            This email will be used for magic link login — the primary way to access your admin
            dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
