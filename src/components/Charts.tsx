import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { Card, CardHeader, CardBody, Divider, Image } from "@heroui/react";

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: ['PPA Approved', 'Pending', 'Under Review'],
  datasets: [
    {
      label: 'Projects',
      data: [15, 8, 5],
      backgroundColor: [
        'rgba(34, 197, 94, 0.6)',  // Success/Green
        'rgba(245, 158, 11, 0.6)', // Warning/Amber
        'rgba(59, 130, 246, 0.6)',  // Primary/Blue
      ],
      borderColor: [
        'rgba(34, 197, 94, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(59, 130, 246, 1)',
      ],
      borderWidth: 1,
    },
  ],
};

export function PieChart(){
    return (
    <Card className="w-full max-w-[400px] shadow-lg">
      <CardHeader className="flex flex-col items-start px-6 pt-6">
        <h4 className="text-large font-bold">Project Distribution</h4>
        <p className="text-small text-default-500">Current PPA Status Overview</p>
      </CardHeader>
      <Divider/>
      <CardBody className="py-8 px-4 flex justify-center items-center">
        <div className="w-full h-[300px]">
          <Pie 
            data={data} 
            options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom' as const,
                }
              }
            }} 
          />
        </div>
      </CardBody>
    </Card>
  );
}


export function BarGraph(){

}

export default {PieChart}