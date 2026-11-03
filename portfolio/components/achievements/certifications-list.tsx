"use client";

import { useState } from "react";
import type { Achievement } from "@/content/types";
import { CertificateModal } from "./certificate-modal";
import { AchievementCard } from "./achievement-card";

export function CertificationsList({ certifications }: { certifications: Achievement[] }) {
  const [selectedCert, setSelectedCert] = useState<Achievement | null>(null);

  return (
    <>
      <div className="achievement-certification-list">
        {certifications.map((entry, idx) => (
          <AchievementCard
            key={entry.id}
            entry={entry}
            index={idx}
            categoryLabel="Professional Credential"
            shape={idx % 2 === 0 ? "clover" : "diamond"}
            iconName="check"
            tone="tertiary"
            onViewDetails={(cert) => setSelectedCert(cert)}
          />
        ))}
      </div>

      {selectedCert ? (
        <CertificateModal
          certificate={selectedCert}
          onClose={() => setSelectedCert(null)}
        />
      ) : null}
    </>
  );
}
