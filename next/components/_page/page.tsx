  export default function PageAdapter() {
    return (
      <div style={{padding:16, border:'1px solid #ddd', borderRadius:12}}>
        <h3 style={{margin:0}}>Адаптер для Event Analysis</h3>
        <p style={{marginTop:8, color:'#666'}}>
          Страница подключена. Замените этот компонент на импорт вашего реального компонента из
          <code>next/components/**</code>, например:
        </p>
        <pre style={{background:'#f7f7f7', padding:12, borderRadius:8, overflowX:'auto'}}>
{`import Real from '../EventAnalysis';
export default function PageAdapter(){ return <Real/> }`}
        </pre>
      </div>
    );
  }
