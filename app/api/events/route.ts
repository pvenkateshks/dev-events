import connectDB from '@/lib/mongodb';
import { NextResponse } from 'next/server'
import Event from '@/database/event.model';
import { v2 as cloudinary } from 'cloudinary'; 


export async function POST(req: Request) {
  try {
    await connectDB()
    const formData = await req.formData();
    let event
    try{
        event = Object.fromEntries(formData);
    } catch (e) {
        return NextResponse.json({ message: 'Invalid Form Data' }, { status: 400 }); 

    }

    const file = formData.get('image') as File;

    if (!file) return NextResponse.json({ message: 'Image file is required' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();  
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: 'image', folder: 'events' },
        (error, results)=>{if(error) return reject(error);
        resolve(results);
    }).end(buffer);
    })

    event.image = (uploadResult as { secure_url: string }).secure_url;

    if (!uploadResult) {
      return NextResponse.json({ message: 'Image upload failed' }, { status: 500 });
    }

    const createdEvent = await Event.create(event);
    return NextResponse.json({ message: 'Event Created Successfully', event: createdEvent }, { status: 201 });   
   } 

    catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'Event Creation Failed', error:e instanceof Error ? e.message : 'Unknown Error' }, { status: 500 });
  
  }}

export async function GET() {
  try {
    await connectDB()
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json({ events, message:'Events fetched successfully', status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: 'Failed to fetch events', error:e instanceof Error ? e.message : 'Unknown Error' }, { status: 500 });
  } }


