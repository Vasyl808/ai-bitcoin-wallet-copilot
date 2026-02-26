import { ArrowUpRight, ArrowDownLeft, Zap, ArrowRightLeft } from 'lucide-react';
import { formatRelativeTime } from '../../modules/analytics';
import type { ParsedTransaction } from '../../types';

interface TransactionsTableProps {
  transactions: ParsedTransaction[];
  isLoading: boolean;
}

function TxTypeBadge({ type, methodName }: { type: string; methodName?: string }) {
  if (type === 'interaction') {
    const label = methodName
      ? methodName.length > 20 ? methodName.slice(0, 20) + '...' : methodName
      : 'Contract Call';
    return <span className="badge badge-purple"><Zap size={9} />{label}</span>;
  }
  if (type === 'generic' || type === 'transfer') {
    return <span className="badge badge-blue"><ArrowRightLeft size={9} />Transfer</span>;
  }
  return <span className="badge badge-gray">{type}</span>;
}

function NetValueBadge({ tx }: { tx: ParsedTransaction }) {
  const net = tx.addressNetValue ? parseInt(tx.addressNetValue, 10) : null;
  if (net === null || isNaN(net)) return <span className="text-muted">—</span>;
  if (net > 0) return (
    <span className="text-green font-mono" style={{ fontSize: '12px' }}>
      <ArrowDownLeft size={10} style={{ display: 'inline' }} />
      +{net.toLocaleString()} sats
    </span>
  );
  if (net < 0) return (
    <span className="text-red font-mono" style={{ fontSize: '12px' }}>
      <ArrowUpRight size={10} style={{ display: 'inline' }} />
      {net.toLocaleString()} sats
    </span>
  );
  return <span className="text-muted font-mono" style={{ fontSize: '12px' }}>0 sats</span>;
}

export default function TransactionsTable({ transactions, isLoading }: TransactionsTableProps) {
  if (isLoading) {
    return (
      <div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
        <p>No transactions found for this address</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Transaction ID</th>
            <th>Type</th>
            <th>Block</th>
            <th>Time</th>
            <th>Net Value</th>
            <th>Gas Used</th>
            <th>Gas Fees</th>
            <th>Priority Fee</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr key={tx.id || i}>
              <td>
                <a
                  href={tx.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-link"
                  title={tx.id}
                >
                  {tx.id.slice(0, 8)}...{tx.id.slice(-6)}
                </a>
              </td>
              <td>
                <TxTypeBadge type={tx.type} methodName={tx.methodName} />
              </td>
              <td>
                {tx.blockHeight ? (
                  <span className="font-mono" style={{ fontSize: '12px' }}>
                    #{tx.blockHeight.toLocaleString()}
                  </span>
                ) : '—'}
              </td>
              <td style={{ whiteSpace: 'nowrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                {formatRelativeTime(tx.blockTime)}
              </td>
              <td><NetValueBadge tx={tx} /></td>
              <td>
                {tx.gasUsed !== undefined && tx.gasUsed !== null ? (
                  <span className="font-mono" style={{ fontSize: '12px' }}>
                    {tx.gasUsed.toLocaleString()}
                  </span>
                ) : '—'}
              </td>
              <td>
                {tx.gasSats !== undefined && tx.gasSats !== null ? (
                  <span className="font-mono" style={{ fontSize: '12px' }}>
                    {tx.gasSats.toLocaleString()} sats
                  </span>
                ) : '—'}
              </td>
              <td>
                {tx.priorityFee !== undefined && tx.priorityFee !== null && tx.priorityFee > 0 ? (
                  <span className="font-mono" style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                    {tx.priorityFee.toLocaleString()} sats
                  </span>
                ) : (
                  <span className="text-muted" style={{ fontSize: '12px' }}>—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
