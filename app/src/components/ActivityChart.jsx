import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import Card, {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";

// Función para limpiar nombres de clases para usar como variables CSS
function cleanClassName(name) {
  if (!name || typeof name !== "string") {
    return "clase-sin-nombre";
  }
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Función para transformar los datos del backend al formato del gráfico
function transformChartData(backendData) {
  if (!backendData?.chartData) return [];

  return backendData.chartData.map((periodo) => {
    const chartPoint = {
      periodo: periodo.periodo,
      periodoLabel: `Sem ${periodo.periodo.split("-")[1]}`,
    };

    // Agregar cada clase como una propiedad
    periodo.registrosPorClase.forEach((clase) => {
      const className = clase.nombreClase || clase.nombre || "Sin nombre";
      const cleanName = cleanClassName(className);
      chartPoint[cleanName] = clase.totalRegistros;
    });

    return chartPoint;
  });
}

// Configuración de colores para el gráfico
function generateChartConfig(clases) {
  const colors = [
    "#f97316", // primary-500
    "#c2410c", // primary-700
    "#7c2d12", // primary-900
    "#ea580c", // primary-600
    "#9a3412", // primary-800
  ];

  const config = {};
  clases.forEach((clase, index) => {
    const className = clase.nombre || clase.nombreClase || "Sin nombre";
    const cleanName = cleanClassName(className);
    config[cleanName] = {
      label: className,
      color: colors[index % colors.length],
    };
  });

  return config;
}

export default function ActivityChart({ data }) {
  if (!data?.chartData || !data?.clases) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Actividad por clase</CardTitle>
          <CardDescription>Registros de actividad por semana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-neutral-500">
            No hay datos disponibles
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = transformChartData(data);
  const chartConfig = generateChartConfig(data.clases);

  // Calcular estadísticas
  const totalRegistros = chartData.reduce((sum, periodo) => {
    return (
      sum +
      data.clases.reduce((clasesSum, clase) => {
        const className = clase.nombre || clase.nombreClase || "Sin nombre";
        const cleanName = cleanClassName(className);
        return clasesSum + (periodo[cleanName] || 0);
      }, 0)
    );
  }, 0);

  const promedioSemanal = Math.round(
    totalRegistros / Math.max(chartData.length, 1)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 w-full">
          <CardTitle className="whitespace-nowrap">
            Actividad por clase
          </CardTitle>
          <div className="flex-grow" />
          <CardDescription className="whitespace-nowrap">
            Registros de las últimas {chartData.length} semanas
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 0,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="periodoLabel"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={20}
              fontSize={11}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {data.clases.map((clase, index) => {
              const className =
                clase.nombre || clase.nombreClase || "Sin nombre";
              const cleanName = cleanClassName(className);
              return (
                <Line
                  key={clase.id || index}
                  dataKey={cleanName}
                  type="monotone"
                  stroke={`var(--color-${cleanName})`}
                  strokeWidth={2}
                  dot={false}
                />
              );
            })}
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {totalRegistros} registros totales
            </div>
            <div className="flex items-center gap-2 leading-none text-neutral-600">
              Promedio de {promedioSemanal} registros por semana
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
