import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, X, Plus } from 'lucide-react';
import { useCdsEvaluate } from '@/hooks/useCds';
import type {
  CdsEvaluationRequest,
  CdsEvaluationResponse,
  CdsFindingDto,
} from '@/types/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// ─── Severity badge ────────────────────────────────────────────────────────────

function severityClass(severity: string): string {
  switch (severity) {
    case 'Critical': return 'bg-red-100 text-red-800';
    case 'NonCritical': return 'bg-yellow-100 text-yellow-800';
    case 'Info': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-700';
  }
}

// ─── Finding card ─────────────────────────────────────────────────────────────

function FindingCard({
  finding,
  cardClass,
}: {
  finding: CdsFindingDto;
  cardClass: string;
}) {
  return (
    <div className={`rounded-lg border p-3 space-y-1 ${cardClass}`}>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityClass(finding.severity)}`}
        >
          {finding.severity}
        </span>
        <span className="font-semibold text-sm">{finding.title}</span>
      </div>
      <p className="text-sm">{finding.description}</p>
      {finding.relatedItem && (
        <p className="text-xs italic text-muted-foreground">{finding.relatedItem}</p>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function CdsEvaluatePage() {
  const cdsEvaluate = useCdsEvaluate();

  const [patientIdInput, setPatientIdInput] = useState('');

  // Tag arrays
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);

  // Current input values for tags
  const [symptomInput, setSymptomInput] = useState('');
  const [allergyInput, setAllergyInput] = useState('');

  // Dynamic rows
  const [labResults, setLabResults] = useState<
    { testName: string; resultValue: string; referenceRange: string }[]
  >([]);
  const [medications, setMedications] = useState<
    { drugName: string; dosage: string }[]
  >([]);

  const [cdsResult, setCdsResult] = useState<CdsEvaluationResponse | null>(null);

  // Tag helpers
  function addSymptom() {
    const trimmed = symptomInput.trim();
    if (trimmed) {
      setSymptoms((prev) => [...prev, trimmed]);
      setSymptomInput('');
    }
  }

  function addAllergy() {
    const trimmed = allergyInput.trim();
    if (trimmed) {
      setAllergies((prev) => [...prev, trimmed]);
      setAllergyInput('');
    }
  }

  // Lab result row helpers
  function addLabResult() {
    setLabResults((prev) => [
      ...prev,
      { testName: '', resultValue: '', referenceRange: '' },
    ]);
  }

  function updateLabResult(
    index: number,
    field: 'testName' | 'resultValue' | 'referenceRange',
    value: string,
  ) {
    setLabResults((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function removeLabResult(index: number) {
    setLabResults((prev) => prev.filter((_, i) => i !== index));
  }

  // Medication row helpers
  function addMedication() {
    setMedications((prev) => [...prev, { drugName: '', dosage: '' }]);
  }

  function updateMedication(
    index: number,
    field: 'drugName' | 'dosage',
    value: string,
  ) {
    setMedications((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }

  function removeMedication(index: number) {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const request: CdsEvaluationRequest = {
      patientId: patientIdInput ? Number(patientIdInput) : undefined,
      symptoms,
      allergies,
      labResults,
      medications: medications.map((m) => ({
        drugName: m.drugName,
        dosage: m.dosage,
      })),
    };

    cdsEvaluate.mutate(request, {
      onSuccess: (result) => {
        setCdsResult(result);
      },
      onError: () => {
        toast.error('Evaluation failed. Please try again.');
      },
    });
  }

  const hasFindings =
    cdsResult &&
    (cdsResult.criticalAlerts.length > 0 ||
      cdsResult.interactionWarnings.length > 0 ||
      cdsResult.diagnosticRecommendations.length > 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Clinical Decision Support</h1>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Form</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient ID */}
            <div className="grid gap-2">
              <Label htmlFor="patientId">Patient ID (optional)</Label>
              <Input
                id="patientId"
                type="number"
                placeholder="Optional — loads stored records if provided"
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
                min={1}
              />
            </div>

            {/* Symptoms */}
            <div className="grid gap-2">
              <Label>Symptoms</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Add a symptom"
                  value={symptomInput}
                  onChange={(e) => setSymptomInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSymptom();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addSymptom}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
              {symptoms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((s, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => setSymptoms((prev) => prev.filter((_, idx) => idx !== i))}
                        className="ml-1 rounded-full hover:bg-blue-200 p-0.5"
                        aria-label={`Remove ${s}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Allergies */}
            <div className="grid gap-2">
              <Label>Known Allergies</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Add an allergy"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addAllergy();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addAllergy}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>
              {allergies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allergies.map((a, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-0.5 text-xs font-medium text-red-800"
                    >
                      {a}
                      <button
                        type="button"
                        onClick={() => setAllergies((prev) => prev.filter((_, idx) => idx !== i))}
                        className="ml-1 rounded-full hover:bg-red-200 p-0.5"
                        aria-label={`Remove ${a}`}
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Lab Results */}
            <div className="grid gap-2">
              <Label>Lab Results</Label>
              {labResults.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Test name"
                    value={row.testName}
                    onChange={(e) => updateLabResult(i, 'testName', e.target.value)}
                  />
                  <Input
                    placeholder="Result value"
                    value={row.resultValue}
                    onChange={(e) => updateLabResult(i, 'resultValue', e.target.value)}
                  />
                  <Input
                    placeholder="Reference range"
                    value={row.referenceRange}
                    onChange={(e) => updateLabResult(i, 'referenceRange', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLabResult(i)}
                    aria-label="Remove lab result"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLabResult} className="w-fit">
                <Plus className="mr-1 size-4" />
                Add Lab Result
              </Button>
            </div>

            {/* Medications */}
            <div className="grid gap-2">
              <Label>Current Medications</Label>
              {medications.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    placeholder="Drug name"
                    value={row.drugName}
                    onChange={(e) => updateMedication(i, 'drugName', e.target.value)}
                  />
                  <Input
                    placeholder="Dosage"
                    value={row.dosage}
                    onChange={(e) => updateMedication(i, 'dosage', e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMedication(i)}
                    aria-label="Remove medication"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addMedication} className="w-fit">
                <Plus className="mr-1 size-4" />
                Add Medication
              </Button>
            </div>

            <Button type="submit" disabled={cdsEvaluate.isPending}>
              {cdsEvaluate.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Evaluating…
                </>
              ) : (
                'Evaluate'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results panel */}
      {cdsResult && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Evaluation Results</h2>

          {!hasFindings ? (
            <div className="rounded-lg border border-green-300 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                No findings — patient appears safe to proceed.
              </p>
            </div>
          ) : (
            <>
              {cdsResult.criticalAlerts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-red-700">Critical Alerts</h3>
                  {cdsResult.criticalAlerts.map((finding) => (
                    <FindingCard
                      key={finding.ruleId}
                      finding={finding}
                      cardClass="border-red-300 bg-red-50"
                    />
                  ))}
                </div>
              )}

              {cdsResult.interactionWarnings.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-yellow-700">Interaction Warnings</h3>
                  {cdsResult.interactionWarnings.map((finding) => (
                    <FindingCard
                      key={finding.ruleId}
                      finding={finding}
                      cardClass="border-yellow-300 bg-yellow-50"
                    />
                  ))}
                </div>
              )}

              {cdsResult.diagnosticRecommendations.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-blue-700">Diagnostic Recommendations</h3>
                  {cdsResult.diagnosticRecommendations.map((finding) => (
                    <FindingCard
                      key={finding.ruleId}
                      finding={finding}
                      cardClass="border-blue-300 bg-blue-50"
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
