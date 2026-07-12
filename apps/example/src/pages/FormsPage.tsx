import { useState } from "react";
import {
  AlertBanner,
  Button,
  Card,
  DatePicker,
  SegmentedControl,
  Select,
  TextInput
} from "@demo-ds/components";

export function FormsPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="page-section" aria-labelledby="forms-heading">
      <div className="section-heading">
        <h2 id="forms-heading">Forms</h2>
        <p>Form controls, helper text, validation copy, and action buttons.</p>
      </div>

      {submitted ? (
        <AlertBanner tone="success" title="Settings saved">
          The generic profile settings were saved for this demo session.
        </AlertBanner>
      ) : null}

      <Card>
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitted(true);
          }}
        >
          <TextInput
            label="Display name"
            helperText="Shown in generic workspace examples."
            defaultValue="Demo user"
          />
          <TextInput label="Contact email" helperText="Used for demo notifications." />
          <Select
            label="Workflow status"
            helperText="A generic controlled option list."
            data={[
              { value: "draft", label: "Draft" },
              { value: "review", label: "In review" },
              { value: "live", label: "Live" }
            ]}
            defaultValue="review"
          />
          <SegmentedControl
            label="Review mode"
            data={[
              { value: "quick", label: "Quick" },
              { value: "full", label: "Full" },
              { value: "manual", label: "Manual" }
            ]}
            defaultValue="full"
          />
          <DatePicker
            label="Target date"
            helperText="Uses an ISO date value from app state."
            defaultValue="2026-07-13"
          />
          <TextInput
            label="Support topic"
            helperText="A short generic request category."
            defaultValue="Component review"
          />
          <TextInput
            label="Required field"
            helperText="This field demonstrates an error state."
            error="Enter a generic value before continuing."
          />
          <div className="form-actions">
            <Button type="submit">Save changes</Button>
            <Button type="button" tone="neutral" emphasis="low">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
