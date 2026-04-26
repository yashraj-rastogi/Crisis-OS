import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * ResolveIncidentPage — redirect shim.
 *
 * The real "Resolve" flow is the confirm-dialog inside LiveResponseBoard.
 * This page is only reached via the HandoffPage "Proceed to Resolution"
 * button, so we redirect there so the manager can complete the flow.
 */
export default function ResolveIncidentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      navigate(`/manager/incidents/${id}/live`, { replace: true });
    }
  }, [id, navigate]);

  return null;
}
