import type { ParsedToken } from '../../types';

interface TokensTableProps {
  tokens: ParsedToken[];
  isLoading: boolean;
}

export default function TokensTable({ tokens, isLoading }: TokensTableProps) {
  if (isLoading) {
    return (
      <div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 44, marginBottom: 8, borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🪙</div>
        <p>No tokens found for this address</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Token Name</th>
            <th>Balance</th>
            <th>Contract</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token, i) => (
            <tr key={i}>
              <td style={{ color: 'var(--text-muted)', width: '40px' }}>{i + 1}</td>
              <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{token.name}</td>
              <td>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                  {Number(token.balance).toLocaleString() !== 'NaN'
                    ? Number(token.balance).toLocaleString()
                    : token.balance}
                </span>
              </td>
              <td>
                {token.contractAddress ? (
                  <a
                    href={`https://opscan.org/contracts/${token.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tx-link"
                  >
                    {token.contractAddress.slice(0, 10)}...
                  </a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
