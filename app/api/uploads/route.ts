import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { projectId, files } = await request.json()

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const uploadedFiles = []

    for (const file of files) {
      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(`${projectId}/${Date.now()}-${file.name}`, file)

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('project-files')
          .getPublicUrl(data.path)

        await supabase.from('project_files').insert({
          project_id: projectId,
          uploaded_by: user.id,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
        } as any)

        uploadedFiles.push({
          name: file.name,
          url: publicUrl,
        })
      }
    }

    return NextResponse.json({ files: uploadedFiles })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
